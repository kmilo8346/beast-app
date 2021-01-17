import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  View,
  Vibration,
  ScrollView,
  GestureResponderEvent,
} from 'react-native';

// constraints
import constraints from './constraints';
// components
import Text from '../../components/text';
import Divider from '../../components/divider';
import Modal from '../../components/modals/modal';
import Input from '../../components/inputs/input';
import Touchable from '../../components/touchable';
import Button from '../../components/buttons/button';
import Toast, { IToast } from '../../components/toast';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../components/loading-overlay';
// clients
import phoneClient from '../../clients/phone-client';
// cache
import userCache from '../../cache/user';
// libs
import validate from '../../lib/validate';
import { capture } from '../../lib/sentry';
// styles
import globalStyles from '../../styles';
import colors from '../../styles/colors';

// instances outside component
const prefix = '[set phone screen]';
const prefixes: Prefix[] = [
  {
    country: 'Chile',
    prefix: '+56',
  },
  {
    country: 'Argentina',
    prefix: '+54',
  },
  {
    country: 'Colombia',
    prefix: '+57',
  },
  {
    country: 'Cuba',
    prefix: '+53',
  },
  {
    country: 'Perú',
    prefix: '+51',
  },
  {
    country: 'Uruguay',
    prefix: '+598',
  },
  {
    country: 'Venezuela',
    prefix: '+58',
  },
];
const format = (
  prefix: string,
  phone: string | undefined,
  spaced: boolean
): string | undefined => {
  if (!phone) return undefined;

  if (!spaced) {
    return phone;
  }

  let result = phone;
  switch (prefix) {
    case '+56':
      result = insertSpace(result, 1);
      result = insertSpace(result, 6);
      break;
    case '+53':
      result = insertSpace(result, 1);
      break;
    default:
      break;
  }
  return result;

  function insertSpace(text: string, position: number): string {
    if (text.length > position) {
      return [text.slice(0, position), ' ', text.slice(position)].join('');
    }
    return text;
  }
};
const parse = (text: string) => {
  return text.replace(/ /g, '');
};
const split = (phone: string): { prefix: string; body: string } => {
  for (let i = 0; i < prefixes.length; i++) {
    const { prefix } = prefixes[i];
    if (phone.startsWith(prefix)) {
      return {
        prefix,
        body: phone.split(prefix)[1],
      };
    }
  }
  throw new Error(`${prefix} Phone not supported`);
};

type Prefix = {
  country: string;
  prefix: string;
};
type ChangeValueAction = {
  type: 'change_value';
  field: string;
  value: string;
};
type ValidatePhoneAction = {
  type: 'validate_phone';
};
type SetFormSubmittedAction = {
  type: 'set_form_submitted';
};
type SetFormErrorsAction = {
  type: 'set_form_errors';
  errors: { [key: string]: string[] };
};
type SetIsVisibleAction = {
  type: 'set_is_visible';
  is_visible: boolean;
};
type SetSelectedPrefixAction = {
  type: 'set_selected_prefix';
  selected_prefix: Prefix;
};
type SetSpacedAction = {
  type: 'set_spaced';
  spaced: boolean;
};
type Action =
  | ChangeValueAction
  | ValidatePhoneAction
  | SetFormSubmittedAction
  | SetFormErrorsAction
  | SetIsVisibleAction
  | SetSelectedPrefixAction
  | SetSpacedAction;
type State = {
  form: {
    // fields
    prefix: string;
    body?: string;
    // generated
    phone: string;
    // other states
    submitted: boolean;
    errors?: { [key: string]: string[] };
  };
  is_visible: boolean;
  spaced: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_value':
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value },
      };
    case 'validate_phone':
      if (!state.form.submitted) return state;

      return {
        ...state,
        form: {
          ...state.form,
          errors: validate(state.form, constraints),
        },
      };
    case 'set_form_submitted':
      return { ...state, form: { ...state.form, submitted: true } };
    case 'set_form_errors':
      return { ...state, form: { ...state.form, errors: action.errors } };
    case 'set_is_visible':
      return { ...state, is_visible: action.is_visible };
    case 'set_spaced':
      return { ...state, spaced: action.spaced };
    default:
      return state;
  }
};

interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(
    reducer,
    (() => {
      const user = userCache.getData();
      let prefix = prefixes[0].prefix;
      let body = '';
      let phone = `${prefix}`;

      if (user?.phone) {
        const splitted = split(user.phone);
        prefix = splitted.prefix;
        body = splitted.body;
        phone = user.phone;
      }

      return {
        form: {
          // fields
          prefix,
          body,
          // generated
          phone,
          // other states
          submitted: false,
        },
        is_visible: false,
        spaced: false,
      };
    })()
  );
  const toastRef = useRef<IToast>(null);
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);

  // event handlers
  const selectPrefix = useCallback(
    (prefix: string) => {
      dispatch({ type: 'set_is_visible', is_visible: false });
      dispatch({ type: 'change_value', field: 'prefix', value: prefix });
    },
    [state]
  );

  const changeValueHandler = (field: string, value: string) => {
    dispatch({ type: 'change_value', field, value });
  };

  const pressPrefixHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_is_visible', is_visible: true });
  };

  const modalRequestCloseHandler = useCallback(() => {
    dispatch({ type: 'set_is_visible', is_visible: false });
  }, []);

  const submitHandler = async () => {
    dispatch({ type: 'set_form_submitted' });

    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      Vibration.vibrate(400);
      dispatch({ type: 'set_form_errors', errors });
      return;
    }

    try {
      await loadingOverlayRef.current?.show();
      const response = await phoneClient.code({
        phone: state.form.phone,
      });
      setTimeout(() => {
        navigation.navigate('VerifyPhone', {
          phone: response.phone,
          codes: [response.code],
          redirect: route.params.redirect,
        });
      }, 300);
    } catch (error) {
      capture(prefix, 'Submit handler error', error);

      toastRef.current?.show({
        type: 'ERROR',
        message: 'Error inesperado, reintente por favor',
        expiration: 3,
      });
    } finally {
      await loadingOverlayRef.current?.hide();
    }
  };

  useEffect(() => {
    dispatch({
      type: 'change_value',
      field: 'phone',
      value: `${state.form.prefix}${state.form.body}`,
    });
    dispatch({ type: 'validate_phone' });
  }, [state.form.prefix, state.form.body]);

  // render logic
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={[{ flex: 1 }, globalStyles.withPadding]}>
        <Text
          level={2}
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginBottom: 10 }}
        >
          Teléfono móvil
        </Text>
        <Text
          level={5}
          weight="light"
          style={{ marginBottom: 60, lineHeight: 23 }}
        >
          Inicia sesión con tu teléfono móvil y únete a nuestra comunidad.
        </Text>

        <View>
          <Touchable
            style={{
              zIndex: 999999999,
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 55,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 45,
            }}
            onPress={pressPrefixHandler}
          >
            <View
              style={{
                backgroundColor: colors.blackLight6,
                paddingHorizontal: 5,
                paddingVertical: 3,
                borderRadius: 2,
              }}
            >
              <Text
                level={6}
                weight="bold"
                numberOfLines={1}
                color={colors.blackLight1}
              >
                {state.form.prefix}
              </Text>
            </View>
          </Touchable>

          <Input
            autoFocus
            returnKeyType="done"
            keyboardType="phone-pad"
            format={(text) => format(state.form.prefix, text, state.spaced)}
            parse={(text) => parse(text)}
            value={state.form.body}
            errors={state.form.errors?.phone}
            style={{
              fontSize: 20,
              paddingLeft: 55,
              fontFamily: 'MonserratBold',
              fontWeight: 'bold',
            }}
            prefixStyle={{ width: 60 }}
            containerStyle={{ marginBottom: 30 }}
            onChangeText={(body) => {
              changeValueHandler('body', body);
            }}
            onSubmitEditing={submitHandler}
            onBlur={() => {
              dispatch({ type: 'set_spaced', spaced: true });
            }}
            onFocus={() => {
              dispatch({ type: 'set_spaced', spaced: false });
            }}
          />
        </View>
      </ScrollView>
      <View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
          globalStyles.withMargin,
        ]}
      >
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Continuar"
          style={globalStyles.withMainActionAir}
          onPress={submitHandler}
        />
      </View>
      {state.is_visible && (
        <Modal
          type="auto"
          title="Selecciona un país"
          onRequestClose={modalRequestCloseHandler}
        >
          <ScrollView style={{ paddingBottom: 20 }}>
            {prefixes.map((prefix) => {
              return (
                <Touchable
                  key={prefix.country}
                  onPress={(event: GestureResponderEvent) => {
                    event.stopPropagation();
                    selectPrefix(prefix.prefix);
                  }}
                >
                  <View style={globalStyles.withMargin}>
                    <Text level={5} style={{ paddingVertical: 15 }}>
                      {`${prefix.country} (${prefix.prefix})`}
                    </Text>
                    <Divider />
                  </View>
                </Touchable>
              );
            })}
          </ScrollView>
        </Modal>
      )}
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
