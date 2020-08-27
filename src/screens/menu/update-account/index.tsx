import React, { useReducer, useEffect } from 'react';
import { ScrollView, View, Vibration } from 'react-native';

// components
import Container from '../../../components/container';
import Button from '../../../components/buttons/button';
import Input from '../../../components/inputs/input';
import InputImages from '../../../components/inputs/input-images';
import InputSelectAddress from '../../../components/inputs/input-select-address';
// containers
import UserProvider from '../../../containers/user';
// libs
import validate from '../../../lib/validate';
// types
import { Place } from '../../../types';
// styles
import globalStyle from '../../../styles';
// constrains
import constraints from './constraints';
import colors from '../../../styles/colors';
import userClient from '../../../clients/user-client';

// instances outside component
const prefix = '[update account info screen]';

type ChangeValueAction = {
  type: 'change_value';
  attribute: string;
  value: string;
};
type ValidateValueAction = {
  type: 'validate_value';
  attribute: string;
  value: string;
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
  | ChangeValueAction
  | ValidateValueAction
  | SetFormSubmittedAction
  | SetFormErrorsAction
  | SetSubmitOpIdAction;
type State = {
  form: {
    // fields
    firstName: string;
    lastName?: string;
    photoUrl: string[];
    currentAddress: string;
    addresses: Place[];
    // other form states
    submitted: boolean;
    // identify the submit
    submitOpId?: number;
    errors?: { [key: string]: string[] };
  };
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_value':
      return {
        ...state,
        form: { ...state.form, [action.attribute]: action.value },
      };
    case 'validate_value':
      if (!state.form.submitted) return state;

      return {
        ...state,
        form: {
          ...state.form,
          errors: validate(state.form, constraints),
        },
      };
    case 'set_form_submitted':
      return {
        ...state,
        form: {
          ...state.form,
          submitted: true,
        },
      };
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
export interface UpdateAccountProps {
  navigation: any;
}

export default ({ navigation }: UpdateAccountProps) => {
  // state
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();

  // preconditions
  if (
    !user ||
    !user.id ||
    !user.firstName ||
    !user.photoUrl ||
    !user.currentAddress ||
    !user.addresses
  ) {
    throw new Error(`${prefix} User must be defined`);
  }

  const [state, dispatch] = useReducer(reducer, {
    form: {
      // fields
      firstName: user.firstName,
      lastName: user.lastName,
      photoUrl: [user.photoUrl],
      currentAddress: user.currentAddress,
      addresses: user.addresses,

      // other form states
      submitted: false,
    },
  });
  // events handlers
  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };

  const pressContinueHandler = () => {
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }
    // update user
    const version = new Date().getTime();
    userClient.update(
      user.id,
      {
        firstName: state.form.firstName,
        lastName: state.form.lastName,
        photoUrl: state.form.photoUrl[0],
        currentAddress: state.form.currentAddress,
        addresses: state.form.addresses,
      },
      version
    );
    // mark end of submit
    dispatch({ type: 'set_submit_op_id', opId: version });
  };
  useEffect(() => {
    if (state.form.submitOpId === user.version) {
      navigation.navigate('Menu');
    }
  }, [
    state.form.submitOpId,
    user.version,
    user.firstName,
    user.lastName,
    user.photoUrl,
    user.currentAddress,
  ]);

  // render logic
  return (
    <Container>
      <ScrollView
        style={[{ flex: 1, paddingTop: 15 }, globalStyle.withPadding]}
      >
        <InputImages
          size={1}
          label="Foto de perfil"
          path={`users/${user.id}/images/\${}`}
          value={state.form.photoUrl}
          errors={state.form.errors?.photoUrl}
          onChange={(photoUrl) => {
            changeHandler('photoUrl', photoUrl);
          }}
        />
        <Input
          placeholder="Rigoberto"
          label="Nombre"
          value={state.form.firstName}
          errors={state.form.errors?.firstName}
          onChangeText={(firstName) => {
            changeHandler('firstName', firstName);
          }}
        />
        <Input
          placeholder="López"
          label="Apellido"
          value={state.form.lastName}
          errors={state.form.errors?.lastName}
          onChangeText={(lastName) => {
            changeHandler('lastName', lastName);
          }}
        />
        <InputSelectAddress />
        <Input
          style={{ color: colors.blackLight3 }}
          editable={false}
          placeholder="your_email@mail.com"
          label="Email"
          value={user.email}
        />
        <Input
          style={{ color: colors.blackLight3 }}
          editable={false}
          placeholder="+5673460078"
          label="Teléfono"
          value={user.phone}
        />
        <View style={globalStyle.withScreenAir} />
      </ScrollView>
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <Button
          title="Guardar cambios"
          style={[globalStyle.withMargin, globalStyle.withMainActionAir]}
          onPress={pressContinueHandler}
        />
      </View>
    </Container>
  );
};
