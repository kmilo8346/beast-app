import React, { useCallback, useReducer, useRef } from 'react';
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
import phoneNumber from '../../lib/phone-number';
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

type Prefix = {
  //id: string;
  country: string;
  prefix: string;
};
type ChangePhoneAction = { type: 'change_phone'; phone: string };
type ValidatePhoneAction = {
  type: 'validate_phone';
  phone: string;
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
type Action =
  | ChangePhoneAction
  | ValidatePhoneAction
  | SetFormSubmittedAction
  | SetFormErrorsAction
  | SetIsVisibleAction
  | SetSelectedPrefixAction;
type State = {
  form: {
    // fields
    phone?: string;
    // other states
    submitted: boolean;
    errors?: { [key: string]: string[] };
  };
  is_visible: boolean;
  selected_prefix: Prefix;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_phone':
      return {
        ...state,
        form: { ...state.form, phone: action.phone },
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
    case 'set_selected_prefix':
      return { ...state, selected_prefix: action.selected_prefix };
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
  const [state, dispatch] = useReducer(reducer, {
    form: {
      phone: userCache.getData()?.phone,
      submitted: false,
    },
    is_visible: false,
    selected_prefix: prefixes[0],
  });
  const toastRef = useRef<IToast>(null);
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);

  // event handlers
  const changePhoneHandler = (phone: string) => {
    dispatch({ type: 'change_phone', phone });
    dispatch({ type: 'validate_phone', phone });
  };

  const pressPrefixHandler = useCallback(() => {
    dispatch({ type: 'set_is_visible', is_visible: true });
  }, []);

  const selectPrefix = useCallback(
    (prefix: Prefix) => {
      const oldphone = state.form.phone;
      const oldPrefix = state.selected_prefix.prefix;
      const newPhone = oldphone?.replace(oldPrefix, prefix.prefix);
      dispatch({ type: 'set_is_visible', is_visible: false });
      dispatch({ type: 'set_selected_prefix', selected_prefix: prefix });
      dispatch({ type: 'change_phone', phone: newPhone || '' });
    },
    [state]
  );

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
        phone: state.form.phone as string,
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

        <Input
          returnKeyType="done"
          keyboardType="phone-pad"
          placeholder="Número de teléfono móvil"
          //format={(text) => format(text, state.selected_prefix.prefix)}
          format={phoneNumber.formatPhone}
          parse={(text) =>
            phoneNumber.parsePhone(text, state.selected_prefix.prefix)
          }
          prefix={
            <Touchable onPress={pressPrefixHandler} style={{ zIndex: 999 }}>
              <Text level={6} style={{ color: colors.black, marginLeft: 5 }}>
                {state.selected_prefix.prefix}
              </Text>
            </Touchable>
          }
          value={state.form.phone}
          errors={state.form.errors?.phone}
          onChangeText={changePhoneHandler}
          containerStyle={{ marginBottom: 30 }}
          onSubmitEditing={submitHandler}
        />
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
                    selectPrefix(prefix);
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
