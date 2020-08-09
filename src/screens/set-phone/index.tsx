import React, { useReducer, useEffect } from 'react';
import { View, Vibration, ScrollView } from 'react-native';
import validate from 'validate.js';

// components
import { Text, Input, Button } from '../../components';
// clients
import userClient from '../../clients/user-client';
// containers
import UserProvider from '../../containers/user';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../styles';
import colors from '../../styles/colors';

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
type SetSubmitOpIdAction = {
  type: 'set_submit_op_id';
  opId: number;
};
type Action =
  | ChangePhoneAction
  | ValidatePhoneAction
  | SetFormSubmittedAction
  | SetFormErrorsAction
  | SetSubmitOpIdAction;
type State = {
  form: {
    // fields
    phone: string;
    // other states
    submitted: boolean;
    // identify the submit
    submitOpId?: number;
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
    case 'set_submit_op_id':
      return {
        ...state,
        form: { ...state.form, submitOpId: action.opId },
      };
    default:
      return state;
  }
};

export interface ScreenProps {
  navigation: any;
  route: any;
}

// validate phone, parse, format phone

export default ({ navigation, route }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    form: {
      phone: '',
      submitted: false,
    },
  });
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();

  // preconditions
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }

  // event handlers
  const changePhoneHandler = (phone: string) => {
    dispatch({ type: 'change_phone', phone });
    dispatch({ type: 'validate_phone', phone });
  };
  const submitHandler = () => {
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      Vibration.vibrate(400);
      dispatch({ type: 'set_form_errors', errors });
      return;
    }
    const version = new Date().getTime();
    userClient.update(
      user.id,
      {
        phone: `+569${state.form.phone}`,
        phoneVerified: false,
      },
      version
    );
    dispatch({ type: 'set_submit_op_id', opId: version });
  };
  useEffect(() => {
    if (state.form.submitOpId && state.form.submitOpId === user.version) {
      navigation.navigate('VerifyPhone', route.params);
    }
  }, [state.form.submitOpId, user.version, user.phone, user.phoneVerified]);

  // render logic
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={[{ flex: 1 }, globalStyles.withPadding]}>
        <Text level={2} weight="bold" style={{ marginBottom: 10 }}>
          Teléfono móvil
        </Text>
        <Text level={5} style={{ marginBottom: 60 }}>
          Ingresa tu número de teléfono
        </Text>
        <Input
          placeholder="Número de teléfono"
          label=""
          keyboardType="phone-pad"
          returnKeyType="done"
          autoFocus
          prefix={
            <Text level={6} weight="bold">
              +569
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
        ]}
      >
        <Button
          title="Continuar"
          style={globalStyles.withMainActionAir}
          onPress={submitHandler}
        />
      </View>
    </View>
  );
};
