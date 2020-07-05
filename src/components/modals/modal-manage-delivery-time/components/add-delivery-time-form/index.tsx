import React, { useReducer, useEffect } from 'react';

// components
import Button from '../../../../buttons/button';
import Input from '../../../../inputs/input';
import Text from '../../../../text';
// types
import {
  DeliveryTime
} from '../../../../../types';
// libs
import validate from '../../../../../lib/validate';
// constraints
import constraints from './constraints';
// styles
import globalStyle from '../../../../../styles';
import styles from './styles';


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
type SetError = {
  type: 'set_error';
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
  | SetError
  | SetSubmittedAction
  | SetFormErrorsAction;

type State = {
  form: DeliveryTime;
  submitted: boolean;
  errors: { [key: string]: string[] };
};

const reducer = (state: State, action: Action): State => {
  let value;
  let newState;
  switch (action.type) {
    case 'change_value':
      value = action.value;
      return {
        ...state,
        form: { ...state.form, [action.attribute]: value },
      };
    case 'validate_value':
      if (!state.submitted) return state;

      return {
        ...state,
        errors: validate(state.form, constraints),
      };
    case 'set_submitted':
      newState = { ...state };
      newState.submitted = true;
      return newState;
    case 'set_form_errors':
      newState = { ...state };
      newState.errors = action.errors;
      return newState;
    default:
      return state;
  }
};

export interface AddDeliveryTimeProps {
  onAdd: (deliveryTime: DeliveryTime) => void;
}

export default ({ onAdd }: AddDeliveryTimeProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    form: {
      deliveryFrom: '',
      deliveryTo: '',
      timeMeasurement: 'M'
    },
    submitted: false,
    errors: {},
  });

  // event hanlders
  const changeHandler = (attribute: string, value: string) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };


  const pressAddHandler = () => {
    try {
      // set submitted
      dispatch({ type: 'set_submitted' });
      // validate
      console.log('form', state.form);
      const errors = validate(state.form, constraints);
      if (errors) {
        console.log('errors', errors);
        dispatch({ type: 'set_form_errors', errors });
        return;
      }
      onAdd({
        ...state.form
      } as DeliveryTime);
    } catch (error) {
      // error
    }
  };

  return (
    <>
      <Text level={5} style={{ marginBottom: 20 }}>
        Agrega el tiempo mínimo y maximo que puedes llegar a tardar al momento de entregar una venta.
      </Text>
      <Input
        placeholder="Tiempo mínimo"
        keyboardType="number-pad"
        value={state.form.deliveryFrom.toString()}
        errors={state.errors?.deliveryFrom}
        onChangeText={(text) => {
          changeHandler('deliveryFrom', text);
        }}
      />
      <Input
        placeholder="Tiempo máximo"
        keyboardType="number-pad"
        value={state.form.deliveryTo.toString()}
        errors={state.errors?.deliveryTo}
        onChangeText={(text) => {
          changeHandler('deliveryTo', text);
        }}
      />
      <Button
        title="Guardar"
        onPress={pressAddHandler}
        style={globalStyle.withMainActionAir}
      />
    </>
  );
};
