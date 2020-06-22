import React, { useReducer, useEffect } from 'react';
import { View, Image } from 'react-native';
import axios, { CancelTokenSource } from 'axios';

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
import validate from '../../../../../lib/validate';
import stringFormatter from '../../../../../lib/formatters/string-formatter';
import stringParser from '../../../../../lib/parsers/string-parser';
// constraints
import constraints from './constraints';
// styles
import globalStyle from '../../../../../styles';

// extending validate validators
validate.validators.paymentMethodIdPresence = (
  _value: any,
  _options: any,
  _key: any,
  attributes: { [key: string]: any }
) => {
  if (attributes.paymentMethodId) {
    return null;
  }
  return '^Tarjeta inválida';
};
const indentificationTypes = [
  {
    key: 'RUT',
    title: 'RUT',
  },
  {
    key: 'Otro',
    title: 'OTRO',
  },
];
let searchPaymentMethodsRequestSource: CancelTokenSource;
let createCardTokenRequestSource: CancelTokenSource;
let createCardRequestSource: CancelTokenSource;

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
  | SetSearchPaymentMethodsResponseAction
  | SetSearchPaymentMethodsErrorAction
  | SetIsLoadingAction
  | SetErrorAction
  | SetSubmittedAction
  | SetFormErrorsAction;

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
    case 'set_search_payment_methods_response':
      newState = { ...state };
      newState.form.paymentMethodId = '';
      newState.form.paymentMethodImage = '';

      if (action.response.hits.length) {
        newState.form.paymentMethodId = action.response.hits[0].id;
        newState.form.paymentMethodImage =
          action.response.hits[0].secureThumbnail;
        // adding dynamics constraints
        const settings = action.response.hits[0].settings[0];
        if (settings.securityCode?.length) {
          constraints.securityCode.length = {
            is: settings.securityCode?.length,
            message: '^Tamaño incorrecto',
          };
        }
        if (settings.cardNumber?.length) {
          constraints.cardNumber.length = {
            is: settings.cardNumber?.length,
            message: '^Tamaño incorrecto',
          };
        }
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
    submitted: false,
    errors: {},
  });
  const bins = state.form.cardNumber.substring(0, 6);
  let cardNumberPrefix: string | JSX.Element = 'credit-card';
  if (state.form.paymentMethodImage) {
    cardNumberPrefix = (
      <Image
        source={{
          uri: state.form.paymentMethodImage,
        }}
        style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
      />
    );
  }

  // event handlers
  const pressAddHandler = async () => {
    try {
      // set submitted
      dispatch({ type: 'set_submitted' });
      // validate
      const errors = validate(state.form, constraints);
      if (errors) {
        dispatch({ type: 'set_form_errors', errors });
        return;
      }
      dispatch({ type: 'set_is_loading' });
      // create token using form data
      if (createCardTokenRequestSource) {
        // cancel running request
        createCardTokenRequestSource.cancel();
      }
      createCardTokenRequestSource = axios.CancelToken.source();
      const expirationMonth = state.form.expirationDate.substr(0, 2);
      const expirationYear = `20${state.form.expirationDate.substr(2)}`;
      const response = await cardTokenClient.create(
        {
          body: {
            cardNumber: state.form.cardNumber,
            securityCode: state.form.securityCode,
            expirationMonth,
            expirationYear,
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
        },
        createCardTokenRequestSource.token
      );
      // create card using mercado pago token
      if (createCardRequestSource) {
        // cancel running request
        createCardRequestSource.cancel();
      }
      createCardRequestSource = axios.CancelToken.source();
      // TODO: receive customerId and mercado pago customer id from props
      const card = await cardClient.create(
        {
          pathVars: { customerId: '126' },
          body: {
            mercadopago_customer_id: '588310597-iCbkpncHLFQgdM',
            token: response.id,
          },
        },
        createCardRequestSource.token
      );
      onAdd(card);
    } catch (error) {
      if (!axios.isCancel(error)) {
        dispatch({ type: 'set_error' });
      }
    }
  };
  const changeHandler = (attribute: string, value: string) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };
  const searchPaymentMethods = async (bins: string) => {
    try {
      if (searchPaymentMethodsRequestSource) {
        // cancel running request
        searchPaymentMethodsRequestSource.cancel();
      }
      searchPaymentMethodsRequestSource = axios.CancelToken.source();
      const response = await paymentMethodClient.search(
        {
          filters: { bins },
          source: ['id', 'secure_thumbnail', 'settings'],
        },
        searchPaymentMethodsRequestSource.token
      );
      dispatch({ type: 'set_search_payment_methods_response', response });
    } catch (error) {
      if (!axios.isCancel(error)) {
        dispatch({ type: 'set_search_payment_methods_error' });
      }
    }
  };
  useEffect(() => {
    if (bins.length === 6) {
      searchPaymentMethods(bins);
    }
    return () => {
      if (searchPaymentMethodsRequestSource) {
        // cancel running request
        searchPaymentMethodsRequestSource.cancel();
      }
    };
  }, [bins]);
  useEffect(() => {
    return () => {
      if (createCardTokenRequestSource) {
        // cancel running request
        createCardTokenRequestSource.cancel();
      }
      if (createCardRequestSource) {
        // cancel running request
        createCardRequestSource.cancel();
      }
    };
  }, []);

  // render logic
  let content: JSX.Element | null = null;
  switch (state.view) {
    case 'LOADING':
      content = (
        <View style={{ height: 150 }}>
          <Loading />
        </View>
      );
      break;
    case 'ERROR':
      content = (
        <View style={{ height: 150 }}>
          <Text level={6} style={{ textAlign: 'center', marginTop: '10%' }}>
            Ocurrió un error, intenta de nuevo
          </Text>
        </View>
      );
      break;
    default:
      content = (
        <>
          <Input
            label="No. Tarjeta"
            placeholder="XXXX XXXX XXXX XXXX"
            prefix={cardNumberPrefix}
            keyboardType="number-pad"
            value={state.form.cardNumber}
            format={stringFormatter.toCreditCard}
            parse={stringParser.fromCreditCard}
            errors={state.errors?.cardNumber}
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
              value={state.form.expirationDate}
              format={stringFormatter.toCreditCardExpirationDate}
              parse={stringParser.fromCreditCardExpirationDate}
              errors={state.errors?.expirationDate}
              containerStyle={{ width: '40%' }}
              onChangeText={(text) => {
                changeHandler('expirationDate', text);
              }}
            />
            <Input
              label="CVV"
              placeholder="040"
              keyboardType="number-pad"
              secureTextEntry
              value={state.form.securityCode}
              errors={state.errors?.securityCode}
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
            errors={state.errors?.cardHolderName}
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
              format={(text) => {
                if (state.form.dockTypeId === 'RUT') {
                  return stringFormatter.toRut(text);
                }
                return text;
              }}
              parse={stringParser.fromRut}
              errors={state.errors?.docNumber}
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
