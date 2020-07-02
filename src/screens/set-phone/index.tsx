import React, { useReducer } from 'react';
import { View } from 'react-native';
import validate from 'validate.js';

// components
import { Container, Text, Input, Button } from '../../components';
// containers
import UserProvider from '../../containers/user';
// constraints
import constraints from './constraints';

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
    phone: string;
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
      dispatch({ type: 'set_form_errors', errors });
      return;
    }
    userContainer.updateUser({
      phone: `+569${state.form.phone}`,
      phoneVerified: false,
    });
    navigation.navigate('VerifyPhone', route.params);
  };

  // render logic
  return (
    <Container safeArea withMargin>
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
        prefix={
          <Text level={6} weight="bold">
            +569
          </Text>
        }
        prefixComponentStyle={{ width: 48 }}
        value={state.form.phone}
        errors={state.form.errors?.phone}
        onChangeText={changePhoneHandler}
        containerStyle={{ marginBottom: 30 }}
        onSubmitEditing={submitHandler}
      />
      <View style={{ flex: 1 }} />
      <Button
        title="Continuar"
        style={{ marginBottom: 70 }}
        onPress={submitHandler}
      />
    </Container>
  );
};
