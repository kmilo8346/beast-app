import React, { useReducer } from 'react';
import { GestureResponderEvent, Vibration, View } from 'react-native';
import validate from 'validate.js';

// screen components
import AddressInput from '../../../address-input';
// components
import Button from '../../../../../components/buttons/button';
import Input from '../../../../../components/inputs/input';
// types
import { Place } from '../../../../../types';
// constraints
import constraints from './constraints';
// styles
import globalStyle from '../../../../../styles';

type ChangeValueAction = {
  type: 'change_value';
  attribute: string;
  value: any;
};
type ValidateValueAction = {
  type: 'validate_value';
};
type SetSubmittedAction = {
  type: 'set_submitted';
};
type SetFormErrorsAction = {
  type: 'set_form_errors';
  errors: { [key: string]: string[] };
};

type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetSubmittedAction
  | SetFormErrorsAction;

type State = {
  form: {
    // fields
    address?: Place | undefined;
    apartment: string;

    // other states
    submitted: boolean;
    errors?: { [key: string]: string[] };
  };
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_value':
      return {
        ...state,
        form: {
          ...state.form,
          [action.attribute]: action.value,
        },
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
    case 'set_submitted':
      return { ...state, form: { ...state.form, submitted: true } };
    case 'set_form_errors':
      return { ...state, form: { ...state.form, errors: action.errors } };
    default:
      return state;
  }
};

export interface AddAddressFormProps {
  onAdd: (address: Place) => void;
}

export default ({ onAdd }: AddAddressFormProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    form: {
      // fields
      address: undefined,
      apartment: '',

      // other states
      submitted: false,
    },
  });

  // event handlers
  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value' });
  };

  const saveHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    // set submitted
    dispatch({ type: 'set_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }
    onAdd({ ...state.form.address, apartment: state.form.apartment } as Place);
  };

  // render logic
  return (
    <View>
      <AddressInput
        label="Dirección"
        value={state.form.address}
        errors={state.form.errors?.address}
        placeholder="Jose Manuel Rodríguez 927"
        onChange={(address) => {
          changeHandler('address', address);
        }}
      />
      <Input
        placeholder="1009"
        label="Dept./Oficina/Piso"
        value={state.form.apartment}
        onChangeText={(text) => {
          changeHandler('apartment', text);
        }}
      />
      <Button
        title="Agregar"
        onPress={saveHandler}
        style={globalStyle.withMainActionAir}
      />
    </View>
  );
};
