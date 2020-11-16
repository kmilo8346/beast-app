import React, { ReactNode, useReducer, useRef } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Keyboard,
  Vibration,
  View,
  Clipboard,
} from 'react-native';
import axios, { CancelTokenSource } from 'axios';
import * as Linking from 'expo-linking';

// constraints
import constraints from './constraints';
// components
import Text from '../../../../components/text';
import Modal from '../../../../components/modals/modal';
import Touchable from '../../../../components/touchable';
import Button from '../../../../components/buttons/button';
import Toast, { IToast } from '../../../../components/toast';
import InputNumeric from '../../../../components/inputs/input-numeric';
// clients
import mpCheckoutClient from '../../../../clients/mercado-pago/checkout-client';
// libs
import validate from '../../../../lib/validate';
import { capture } from '../../../../lib/sentry';
import stringParser from '../../../../lib/parsers/string-parser';
import numberFormatter from '../../../../lib/formatters/number-formatter';
// types
import globalStyles from '../../../../styles';
import { Order, PaymentProvider, Store } from '../../../../types';
import colors from '../../../../styles/colors';

// instaces outside component
const prefix = '[create payment link modal]';
let fetchRequestSource: CancelTokenSource;

type ChangeValueAction = {
  type: 'change_value';
  attribute: string;
  value: any;
};
type ValidateValueAction = {
  type: 'validate_value';
  attribute: string;
  value: any;
};
type SetFormSubmittedAction = {
  type: 'set_form_submitted';
};
type SetFormErrorsAction = {
  type: 'set_form_errors';
  errors: { [key: string]: string[] };
};
type ResetAction = {
  type: 'reset';
};
type SetLoadingAction = {
  type: 'set_loading';
  loading: boolean;
};
type SetErrorAction = {
  type: 'set_error';
  error: Error;
};
type SetLinkAction = {
  type: 'set_link';
  link: string;
};
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetFormSubmittedAction
  | SetFormErrorsAction
  | ResetAction
  | SetLoadingAction
  | SetErrorAction
  | SetLinkAction;
type State = {
  form: {
    amount: number;

    submitted: boolean;
    errors?: { [key: string]: string[] };
  };
  loading: boolean;
  error?: Error;
  link?: string;
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
    case 'reset':
      return { ...state, error: undefined, link: undefined };
    case 'set_loading':
      return { ...state, loading: action.loading };
    case 'set_error':
      return { ...state, error: action.error };
    case 'set_link':
      return { ...state, link: action.link };
    default:
      return state;
  }
};

interface ComponentProps {
  order: Order;
  store: Store;
  onClose: () => void;
}

export default ({ order, store, onClose }: ComponentProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    form: {
      amount: order.stats.amount,
      submitted: false,
    },
    loading: false,
  });
  const toastRef = useRef<IToast>(null);
  // console.log(typeof state.form.amount, state.form.amount);

  // event handlers
  const createLink = async (amount: number) => {
    try {
      dispatch({ type: 'reset' });
      dispatch({ type: 'set_loading', loading: true });
      if (fetchRequestSource) {
        fetchRequestSource.cancel();
      }
      fetchRequestSource = axios.CancelToken.source();

      const response = await mpCheckoutClient.create({
        body: {
          customer: {
            email: order.customer.email,
            first_name: order.customer.first_name,
            last_name: order.customer.last_name,
            phone: order.customer.phone,
          },
          transaction: {
            currency: order.transaction.currency,
            delivery_address: {
              street_number: order.transaction.delivery_address.street_number,
              route: order.transaction.delivery_address.route,
            },
            store: {
              name: order.transaction.shopping_cart.store.name,
              payment_provider: store.payment_provider as PaymentProvider,
            },
            amount,
          },
        },
      });
      dispatch({ type: 'set_link', link: response.init_point });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Create link error', error);

        dispatch({ type: 'set_error', error });
      }
    } finally {
      dispatch({ type: 'set_loading', loading: false });
    }
  };

  const submit = () => {
    Keyboard.dismiss();
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }

    createLink(state.form.amount as number);
  };

  const requestCloseHandler = () => {
    onClose();
  };

  const changeAmountHandler = (amount: number) => {
    dispatch({ type: 'change_value', attribute: 'amount', value: amount });
    dispatch({ type: 'validate_value', attribute: 'amount', value: amount });
  };

  const submitEditingHandler = () => {
    submit();
  };

  const pressContinueHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    submit();
  };

  const retryHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    createLink(state.form.amount as number);
  };

  const pressCopyHandler = async (event: GestureResponderEvent) => {
    event.stopPropagation();
    try {
      await Clipboard.setString(state.link as string);

      toastRef.current?.show({
        type: 'SUCCESS',
        message: `¡Vínculo copiado correctamente!`,
        expiration: 2,
      });
    } catch (error) {
      capture(prefix, 'Press copy handler error', error);
    }
  };

  const pressSendToClientHandler = async (event: GestureResponderEvent) => {
    event.stopPropagation();

    try {
      await Linking.openURL(
        `whatsapp://send?text=${`Hola, puedes pagar tu pedido de ${order.transaction.shopping_cart.store.name} en el siguiente vínculo:\n${state.link}`}&phone=${
          order.customer.phone
        }`
      );
      onClose();
    } catch (error) {
      capture(prefix, 'Press send to client handler error', error);
    }
  };

  // render logic
  let title = 'Vínculo de cobro';
  let content: ReactNode = (
    <View style={globalStyles.withMargin}>
      <Text
        level={5}
        weight="light"
        style={{ lineHeight: 23, marginBottom: 30 }}
      >
        Crea un vínculo de cobro hacia tu cuenta de Mercado Pago.
      </Text>
      <InputNumeric
        required
        label="Monto"
        value={state.form.amount}
        maxLength={15}
        errors={state.form.errors?.amount}
        placeholder="$1000"
        returnKeyType="done"
        clearButtonMode="never"
        parseNumber={stringParser.fromCurrency}
        formatNumber={numberFormatter.toCurrency}
        containerStyle={{ marginBottom: 30 }}
        onChangeValue={changeAmountHandler}
        onSubmitEditing={submitEditingHandler}
      />
      <Button
        title="Continuar"
        style={globalStyles.withMainActionAir}
        onPress={pressContinueHandler}
      />
    </View>
  );
  if (state.error) {
    title = 'Vínculo de cobro';
    content = (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          height: 150,
        }}
      >
        <Text level={6} weight="bold" style={{ marginBottom: 15 }}>
          Ocurrió un error inesperado
        </Text>
        <Text level={6} style={{ marginBottom: 10 }}>
          El error fue registrado para su solución
        </Text>
        <Button title="Reintentar" type="link" onPress={retryHandler} />
      </View>
    );
  }
  if (state.loading) {
    title = 'Creando vínculo...';
    content = (
      <View
        style={{
          height: 150,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator color={colors.black} />
      </View>
    );
  }
  if (state.link) {
    title = 'Vínculo creado';
    content = (
      <View style={globalStyles.withMargin}>
        <Text
          level={5}
          weight="light"
          style={{ lineHeight: 23, marginBottom: 30 }}
        >
          Realiza un cobro por un monto de
          {` `}
          <Text level={5} weight="bold">
            {numberFormatter.toCurrency(state.form.amount as number)}
          </Text>
        </Text>
        <Touchable
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colors.blackLight6,
            marginBottom: 30,
            paddingVertical: 10,
            paddingHorizontal: 10,
            borderRadius: 10,
          }}
          onPress={pressCopyHandler}
        >
          <Text
            level={5}
            weight="light"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ marginRight: 5, flex: 1 }}
          >
            {state.link}
          </Text>

          <Text level={7} style={{ marginLeft: 3 }}>
            Copiar
          </Text>
        </Touchable>
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Enviar a cliente"
          style={globalStyles.withMainActionAir}
          onPress={pressSendToClientHandler}
        />
      </View>
    );
  }
  return (
    <Modal title={title} onRequestClose={requestCloseHandler}>
      {content}
    </Modal>
  );
};
