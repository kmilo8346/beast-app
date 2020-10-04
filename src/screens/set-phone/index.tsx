import React, { useReducer, useRef } from 'react';
import { View, Vibration, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import Text from '../../components/text';
import Input from '../../components/inputs/input';
import Button from '../../components/buttons/button';
import Toast, { IToast } from '../../components/toast';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../components/loading-overlay';
// clients
import userClient from '../../clients/user-client';
// libs
import validate from '../../lib/validate';
import { capture } from '../../lib/sentry';
import stringFormatter from '../../lib/formatters/string-formatter';
import stringParser from '../../lib/parsers/string-parser';
// cache
import userCache from '../../cache/user';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../styles';
import colors from '../../styles/colors';
import { LoggedUser } from '../../types';

// instances outside component
const prefix = '[set phone screen]';

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
type Action =
  | ChangePhoneAction
  | ValidatePhoneAction
  | SetFormSubmittedAction
  | SetFormErrorsAction;
type State = {
  form: {
    // fields
    phone?: string;
    // other states
    submitted: boolean;
    errors?: { [key: string]: string[] };
  };
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
          errors: validate.single(state.form.phone, constraints.phone),
        },
      };
    case 'set_form_submitted':
      return { ...state, form: { ...state.form, submitted: true } };
    case 'set_form_errors':
      return { ...state, form: { ...state.form, errors: action.errors } };
    default:
      return state;
  }
};

interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  const insets = useSafeAreaInsets();
  // state
  const user = userCache.getData() as LoggedUser;
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const [state, dispatch] = useReducer(reducer, {
    form: {
      phone: user.phone,
      submitted: false,
    },
  });

  const toastRef = useRef<IToast>(null);
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);

  // event handlers
  const changePhoneHandler = (phone: string) => {
    dispatch({ type: 'change_phone', phone });
    dispatch({ type: 'validate_phone', phone });
  };

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
      loadingOverlayRef.current?.show();
      const update = {
        phone: state.form.phone,
        phone_verified: false,
      };
      await userClient.update({
        pathVars: {
          id: user.id,
        },
        body: update,
      });
      await userCache.updateData(update);
      navigation.goBack();
    } catch (error) {
      capture(prefix, 'Submit handler error', error);

      toastRef.current?.show({
        type: 'ERROR',
        message: 'Error inesperado, reintente por favor',
        expiration: 3,
      });
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  // render logic
  let title = 'Agrega teléfono móvil';
  if (user.phone) {
    title = 'Actualiza teléfono móvil';
  }
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
          {title}
        </Text>
        <Text
          level={5}
          weight="light"
          style={{ marginBottom: 60, lineHeight: 23 }}
        >
          Usaremos tu teléfono para comunicarnos de ser necesario.
        </Text>
        <Input
          autoFocus
          returnKeyType="done"
          keyboardType="phone-pad"
          placeholder="Número de teléfono móvil"
          format={stringFormatter.toPhone}
          parse={stringParser.fromPhone}
          prefix={
            <Text level={6} style={{ color: colors.black, marginLeft: 10 }}>
              +56
            </Text>
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
          { paddingBottom: insets.bottom },
        ]}
      >
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Continuar"
          style={globalStyles.withMainActionAir}
          onPress={submitHandler}
        />
      </View>
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
