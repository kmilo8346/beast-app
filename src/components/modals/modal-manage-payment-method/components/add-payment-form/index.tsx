import React, { useReducer } from 'react';
import { View } from 'react-native';
import validate from 'validate.js';

// components
import Button from '../../../../buttons/button';
import Input from '../../../../inputs/input';
import InputSelectOptions from '../../../../inputs/input-select-options';
// types
import { Payment } from '../../../../../types';
// libs
import stringFormatter from '../../../../../lib/formatters/string-formatter';
// styles
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
  form: {
    cardNumber: string;
    expirationDate: string;
    securityCode: string;
    cardHolderName: string;
    dockTypeId: string;
    docNumber: string;
  };
  errors: { [key: string]: string[] };
};

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
              message: 'Número incorrecto',
            },
            length: {
              minimum: 16,
              tooShort: 'Número incompleto',
            },
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

export default ({ onAdd }: AddPaymentFormProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    form: {
      cardNumber: '',
      expirationDate: '',
      securityCode: '',
      cardHolderName: '',
      dockTypeId: 'RUT',
      docNumber: '',
    },
    errors: {},
  });
  const formattedCardNumber = stringFormatter.toCreditCard(
    state.form.cardNumber
  );
  const formattedExpirationDate = stringFormatter.toCreditCardExpirationDate(
    state.form.expirationDate
  );

  // event handlers
  const pressAddHandler = async () => {};
  const changeHandler = (attribute: string, value: string) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };

  // render logic
  return (
    <View>
      <Input
        label="No. Tarjeta"
        placeholder="XXXX XXXX XXXX XXXX"
        prefix="credit-card"
        keyboardType="number-pad"
        maxLength={19}
        value={formattedCardNumber}
        onChangeText={(text) => {
          changeHandler('cardNumber', text);
        }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Input
          label="Fecha de vto."
          placeholder="MM/AA"
          keyboardType="number-pad"
          maxLength={5}
          value={formattedExpirationDate}
          containerStyle={{ width: '40%' }}
          onChangeText={(text) => {
            changeHandler('expirationDate', text);
          }}
        />
        <Input
          label="CVV"
          placeholder="040"
          keyboardType="number-pad"
          maxLength={3}
          value={state.form.securityCode}
          containerStyle={{ width: '40%' }}
          onChangeText={(text) => {
            changeHandler('validDate', text);
          }}
        />
      </View>
      <Input
        label="Nombre en tarjeta"
        placeholder="Jonathan Ramirez"
        value={state.form.cardHolderName}
        errors={state.errors.cardHolder}
        onChangeText={(text) => {
          changeHandler('cardHolderName', text);
        }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <InputSelectOptions
          label="Tipo documento"
          value={state.form.dockTypeId}
          onChange={(key) => {
            changeHandler('dockTypeId', key);
          }}
          options={[
            {
              key: 'RUT',
              title: 'Rut',
            },
            {
              key: 'Otro',
              title: 'Otro',
            },
          ]}
          // containerStyle={{ width: '30%' }}
          // onChangeText={(text) => {
          //   changeHandler('validDate', text);
          // }}
        />
        <Input
          label="Num. documento"
          value={state.form.docNumber}
          containerStyle={{ width: '60%' }}
          onChangeText={(text) => {
            changeHandler('validDate', text);
          }}
        />
      </View>

      <Button
        title="Agregar"
        onPress={pressAddHandler}
        style={globalStyle.withMainActionAir}
      />
    </View>
  );
};
