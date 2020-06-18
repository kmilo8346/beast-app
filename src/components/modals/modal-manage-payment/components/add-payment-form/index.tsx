import React, { useReducer } from 'react';
import { View } from 'react-native';
import validate from 'validate.js';

import Button from '../../../../buttons/button';
import Card from '../../../../card';
import Input from '../../../../inputs/input';
import { Payment } from '../../../../../types';
import globalStyle from '../../../../../styles';

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
type Action = ChangeValueAction | ValidateValueAction;

type State = {
  form: { [key: string]: string };
  errors: { [key: string]: string[] };
  validPayment: boolean;
};

const formatDate = (date = '') => {
  let newDate = date.replace(/\D/g, '');
  return newDate.length < 3 ? newDate : `${newDate.slice(0, 2)} / ${newDate.slice(2, 4)}`;
}

const reducer = (state: State, action: Action): State => {
  let error;
  switch (action.type) {
    case 'change_value':
      return {
        ...state,
        form: { ...state.form, [action.attribute]: action.value },
      };
    case 'validate_value':
      error = [];
      switch (action.attribute) {
        case 'cardNumber':
          error = validate.single(action.value, {
            presence: {
              allowEmpty: false,
              message: 'El número es requerido',
            },
            format: {
              pattern: /^(34|37|4|5[1-5]).*$/, // Visa, Mastercard, American Express
              message: "Número incorrecto"
            },
            length: {
              minimum: 16,
              tooShort: "Número incompleto"
            }
          });
          break;
        case 'validDate':
          error = validate.single(action.value, {
            presence: {
              allowEmpty: false,
              message: 'La fecha de validez es requerida',
            },
          });
          break;
        case 'cardHolder':
          error = validate.single(action.value, {
            presence: {
              allowEmpty: false,
              message: 'El nombre es requerido',
            },
          });
          break;
        default:
          break;
      }
      return {
        ...state,
        errors: { ...state.errors, [action.attribute]: error },
      };
    default:
      return state;
  }
};

export interface AddPaymentFormProps {
  onAdd: (payment: Payment) => void;
}

const defaultState: State = {
  form: {},
  errors: {},
  validPayment: false
}

export default ({ onAdd }: AddPaymentFormProps) => {
  const [state, dispatch] = useReducer(reducer, defaultState);

  const changeHandler = (attribute: string, value: string) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };

  const validToSave = () => {
    return false;
  }

  const addHandler = () => {
    // const type = getCardType(state.form.cardNumber);
    // Validar contra mercado pago
    onAdd({
      id: state.form.cardNumber,
      type: 'Crédito',
      cardNumber: state.form.cardNumber,
      cardHolder: state.form.cardHolder,
      validDate: state.form.validDate,
    });
  };

  return (
    <View>
      <Input
        placeholder="número de la tarjeta"
        label="No. Tarjeta"
        keyboardType="number-pad"
        maxLength={16}
        value={state.form.cardNumber}
        errors={state.errors.cardNumber}
        onChangeText={(text) => {
          changeHandler('cardNumber', text);
        }}
      />
      <Input
        placeholder="03 / 23"
        label="Válido hasta:"
        keyboardType="number-pad"
        maxLength={7}
        value={formatDate(state.form.validDate)}
        errors={state.errors.validDate}
        onChangeText={(text) => {
          changeHandler('validDate', text);
        }}
      />
      <Input
        placeholder="nombre de la targeta"
        label="Nombre"
        value={state.form.cardHolder}
        errors={state.errors.cardHolder}
        onChangeText={(text) => {
          changeHandler('cardHolder', text);
        }}
      />
      <Button
        disabled={validToSave()}
        title="Agregar"
        onPress={addHandler}
        style={globalStyle.withMainActionAir}
      />
    </View>
  );
};
