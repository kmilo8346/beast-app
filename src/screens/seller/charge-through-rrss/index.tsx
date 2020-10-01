import React, { useReducer, useRef } from 'react';
import { ScrollView, Vibration, View } from 'react-native';
import axios, { CancelTokenSource } from 'axios';
import Constants from 'expo-constants';

// constraints
import constraints from './constraints';
// components
import Text from '../../../components/text';
import Input from '../../../components/inputs/input';
import InputNumeric from '../../../components/inputs/input-numeric';
import Toast, { IToast } from '../../../components/toast';
import Button from '../../../components/buttons/button';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../../components/loading-overlay';
// libs
import validate from '../../../lib/validate';
import numberFormatter from '../../../lib/formatters/number-formatter';
import stringParser from '../../../lib/parsers/string-parser';
import { capture } from '../../../lib/sentry';
import { v4 as uuidv4 } from '../../../lib/uuid';
// cache
import storeCache from '../../../cache/store';
// clients
import paymentClient from '../../../clients/payment-client';
// types
import { DispatchProvider, PaymentProvider } from '../../../types';
// styles
import colors from '../../../styles/colors';
import globalStyles from '../../../styles';

// instances outside component
const prefix = '[charge through rrss screen]';
let fetchRequestSource: CancelTokenSource;

type ChangeValueAction = {
  type: 'change_value';
  attribute: string;
  value: any;
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
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetFormSubmittedAction
  | SetFormErrorsAction;
type State = {
  form: {
    // fields
    price?: number;
    name?: string;

    // other form states
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
    case 'set_form_submitted':
      return { ...state, form: { ...state.form, submitted: true } };
    case 'set_form_errors':
      return { ...state, form: { ...state.form, errors: action.errors } };
    default:
      return state;
  }
};

export interface MySalesProps {
  navigation: any;
}

export default ({ navigation }: MySalesProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    form: {
      // other form states
      submitted: false,
    },
  });
  const toastRef = useRef<IToast>(null);
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);
  const store = storeCache.getData();
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }

  // event handlers
  const createPayment = async () => {
    if (fetchRequestSource) {
      fetchRequestSource.cancel();
    }
    fetchRequestSource = axios.CancelToken.source();
    const id = uuidv4();
    const response = await paymentClient.create(
      {
        body: {
          transaction: {
            country: Constants.manifest.extra.BEAST_COUNTRY,
            currency: Constants.manifest.extra.BEAST_CURRENCY,
            language: Constants.manifest.extra.BEAST_LANGUAGE,
            shopping_cart: [
              {
                id,
                qty: 1,
                name: state.form.name as string,
                store: store.id,
                price: state.form.price as number,
                tags: [],
                images: [
                  'https://res.cloudinary.com/firedevs/image/upload/v1601396130/beast/assets/squared-logo_vy9ouy.png',
                ],
                enabled: true,
                reference: id,
                description: 'Producto vendido por red social',
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
            store: {
              ...store,
              // use another dispatch provider
              dispatch_provider: DispatchProvider.OWNER_RRSS,
            },
          },
          payment_provider_id: PaymentProvider.MERCADOPAGO,
          dispatch_provider_id: DispatchProvider.OWNER_RRSS,
        },
        source: ['id', 'provider'],
      },
      fetchRequestSource.token
    );
    return response;
  };

  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };

  const pressGenerateLinkHandler = async () => {
    try {
      loadingOverlayRef.current?.show();
      dispatch({ type: 'set_form_submitted' });
      // validate
      const errors = validate(state.form, constraints);
      if (errors) {
        Vibration.vibrate(400);
        dispatch({ type: 'set_form_errors', errors });
        return;
      }
      const response = await createPayment();
      setImmediate(() => {
        navigation.navigate('RRSSLinkCreated', {
          ammount: state.form.price,
          concept: state.form.name,
          link: response.provider.checkout.init_point,
        });
      });
    } catch (error) {
      capture(prefix, 'Press generate link handler error', error);

      toastRef.current?.show({
        message: 'Ocurrió un error, por favor reintente',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  // render logic
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={[globalStyles.withPadding, { flex: 1 }]}>
        <Text level={2} weight="bold" style={{ marginBottom: 10 }}>
          Crear vínculo
        </Text>
        <Text level={5} style={{ marginBottom: 30, lineHeight: 23 }}>
          Cobrar en redes sociales nunca fue tan fácil.
        </Text>

        <InputNumeric
          label="Monto"
          maxLength={15}
          placeholder="$1000"
          value={state.form.price}
          errors={state.form.errors?.price}
          formatNumber={numberFormatter.toCurrency}
          parseNumber={stringParser.fromCurrency}
          clearButtonMode="never"
          onChangeValue={(price) => {
            changeHandler('price', price);
          }}
        />
        <Input
          label="Concepto"
          placeholder="Torta tres leches"
          value={state.form.name}
          errors={state.form.errors?.name}
          lengthCounter
          maxLength={30}
          onChangeText={(text) => {
            changeHandler('name', text);
          }}
        />

        <View style={globalStyles.withScreenAir} />
      </ScrollView>

      <View style={[globalStyles.withMargin]}>
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Continuar"
          style={globalStyles.withMainActionAir}
          onPress={pressGenerateLinkHandler}
        />
      </View>
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
