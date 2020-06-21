import React, { useReducer, useEffect } from 'react';
import { View } from 'react-native';
import validate from 'validate.js';

// components
import Button from '../../../../buttons/button';
import Input from '../../../../inputs/input';
import InputSelectOptions from '../../../../inputs/input-select-options';
import Loading from '../../../../loading';
import Text from '../../../../text';
// clients
import paymentMethodClient from '../../../../../clients/payment-method-client';
import cardTokenClient from '../../../../../clients/card-token-client';
import cardClient from '../../../../../clients/card-client';
// types
import { Card, SearchResponse } from '../../../../../types';
// libs
import stringFormatter from '../../../../../lib/formatters/string-formatter';
// styles
import globalStyle from '../../../../../styles';

// TODO: add to constants
const indentificationTypes = [
  {
    key: 'RUT',
    title: 'Rut',
  },
  {
    key: 'Otro',
    title: 'Otro',
  },
];

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
type SetSearchPaymentMethodsResponseAction = {
  type: 'set_search_payment_methods_response';
  response: SearchResponse<{ [key: string]: any }>;
};
type SetSearchPaymentMethodsErrorAction = {
  type: 'set_search_payment_methods_error';
};
type SetIsLoadingAction = {
  type: 'set_is_loading';
};
type SetErrorAction = {
  type: 'set_error';
};
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetSearchPaymentMethodsResponseAction
  | SetSearchPaymentMethodsErrorAction
  | SetIsLoadingAction
  | SetErrorAction;

type State = {
  view: 'FORM' | 'LOADING' | 'ERROR';
  form: {
    cardNumber: string;
    expirationDate: string;
    securityCode: string;
    cardHolderName: string;
    dockTypeId: string;
    docNumber: string;
    paymentMethodImage: string;
    // hidden field
    paymentMethodId: string;
  };
  errors: { [key: string]: string[] };
};

const reducer = (state: State, action: Action): State => {
  let error;
  let value;
  let newState;
  switch (action.type) {
    case 'change_value':
      value = action.value;
      // parsing logic
      switch (action.attribute) {
        case 'cardNumber':
          // remove all white spaces
          value = value.replace(/ /g, '');
          break;

        default:
          break;
      }
      return {
        ...state,
        form: { ...state.form, [action.attribute]: value },
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
    case 'set_search_payment_methods_response':
      newState = { ...state };
      newState.form.paymentMethodId = '';
      newState.form.paymentMethodImage = '';

      if (action.response.hits.length) {
        newState.form.paymentMethodId = action.response.hits[0].id;
        newState.form.paymentMethodImage =
          action.response.hits[0].secureThumbnail;
      }
      return newState;
    case 'set_search_payment_methods_error':
      newState = { ...state };
      newState.form.paymentMethodId = '';
      newState.form.paymentMethodImage = '';
      return newState;
    case 'set_is_loading':
      newState = { ...state };
      newState.view = 'LOADING';
      return newState;
    case 'set_error':
      newState = { ...state };
      newState.view = 'ERROR';
      return newState;
    default:
      return state;
  }
};

export interface AddCardFormProps {
  onAdd: (card: Card) => void;
}

export default ({ onAdd }: AddCardFormProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    view: 'FORM',
    form: {
      cardNumber: '',
      expirationDate: '',
      securityCode: '',
      cardHolderName: '',
      dockTypeId: 'RUT',
      docNumber: '',
      paymentMethodImage: '',
      paymentMethodId: '',
    },
    errors: {},
  });
  const formattedCardNumber = stringFormatter.toCreditCard(
    state.form.cardNumber
  );
  const formattedExpirationDate = stringFormatter.toCreditCardExpirationDate(
    state.form.expirationDate
  );
  const bins = state.form.cardNumber.substring(0, 6);

  // event handlers
  const pressAddHandler = async () => {
    try {
      // TODO: add validate
      dispatch({ type: 'set_is_loading' });
      // create token using form data
      const [expirationMonth, expirationYear] = state.form.expirationDate.split(
        '/'
      );
      const response = await cardTokenClient.create({
        body: {
          cardNumber: state.form.cardNumber,
          securityCode: state.form.securityCode,
          expirationMonth,
          expirationYear: parseInt(`20${expirationYear}`, 10),
          cardholder: {
            name: state.form.cardHolderName,
            identification: {
              type: indentificationTypes.find(
                (type) => type.key === state.form.dockTypeId
              )?.title,
              number: state.form.docNumber,
            },
          },
        },
        source: ['id'],
      });
      // create card using mercado pago token
      const card = await cardClient.create({
        pathVars: { customerId: '126' },
        body: {
          mercadopago_customer_id: '588310597-iCbkpncHLFQgdM',
          token: response.id,
        },
      });
      onAdd(card);
    } catch (error) {
      dispatch({ type: 'set_error' });
    }
  };
  const changeHandler = (attribute: string, value: string) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };
  const searchPaymentMethods = async (bins: string) => {
    try {
      const response = await paymentMethodClient.search({
        filters: { bins },
        source: ['id', 'secure_thumbnail'],
      });
      dispatch({ type: 'set_search_payment_methods_response', response });
    } catch (error) {
      dispatch({ type: 'set_search_payment_methods_error' });
    }
  };

  useEffect(() => {
    if (bins.length === 6) {
      searchPaymentMethods(bins);
    }
    // TODO: cancel request
  }, [bins]);

  // render logic
  let content: JSX.Element | null = null;
  switch (state.view) {
    case 'LOADING':
      content = (
        <View style={{ height: 150, maxHeight: 150 }}>
          <Loading />
        </View>
      );
      break;
    case 'ERROR':
      content = (
        <Text level={6} style={{ textAlign: 'center' }}>
          Ocurrió un error, intenta de nuevo
        </Text>
      );
      break;

    default:
      content = (
        <>
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
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
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
                changeHandler('securityCode', text);
              }}
            />
          </View>
          <Input
            label="Nombre en Tarjeta"
            placeholder="Jonathan Ramirez"
            value={state.form.cardHolderName}
            errors={state.errors.cardHolder}
            onChangeText={(text) => {
              changeHandler('cardHolderName', text);
            }}
          />
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <InputSelectOptions
              label="Tipo Documento"
              value={state.form.dockTypeId}
              onChange={(key) => {
                changeHandler('dockTypeId', key);
              }}
              options={indentificationTypes}
            />
            <Input
              label="Num. Documento"
              value={state.form.docNumber}
              containerStyle={{ width: '60%' }}
              onChangeText={(text) => {
                changeHandler('docNumber', text);
              }}
            />
          </View>
        </>
      );
      break;
  }
  return (
    <View>
      {content}
      <Button
        title="Agregar"
        onPress={pressAddHandler}
        style={globalStyle.withMainActionAir}
      />
    </View>
  );
};
