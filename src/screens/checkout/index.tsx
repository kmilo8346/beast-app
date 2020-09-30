import React, { useReducer, useEffect } from 'react';
import { View, GestureResponderEvent } from 'react-native';
import Constants from 'expo-constants';
import axios, { CancelTokenSource } from 'axios';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { CommonActions } from '@react-navigation/native';
import * as Permissions from 'expo-permissions';

// components
import ErrorView from '../../components/error-view';
import Text from '../../components/text';
import CheckBlueThinImage from '../../components/svgs/images/check-blue-thin';
import SearchingCardImage from '../../components/svgs/images/searching-card';
import RapidCashImage from '../../components/svgs/images/rapid-cash';
import BrokenCardImage from '../../components/svgs/images/broken-card';
import MercadoPagoImage from '../../components/svgs/images/mercadopago-logo';
import Button from '../../components/buttons/button';
// clients
import paymentClient from '../../clients/payment-client';
// types
import {
  Store,
  MercadopagoPaymentStatus,
  LoggedUser,
  PaymentProvider,
  DispatchProvider,
  CreatePayment,
} from '../../types';
// cache
import userCache from '../../cache/user';
import shoppingCartsCache from '../../cache/shopping-carts';
import ShoppingCartCache, {
  ShoppingCartSnapshot,
} from '../../cache/shopping-cart';
// libs
import { generatePushID } from '../../lib/uuid';
import { capture } from '../../lib/sentry';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[checkout screen]';
let fetchRequestSource: CancelTokenSource;
const redirectUrl = Linking.makeUrl();

type SetIdempotencyAction = {
  type: 'set_idempotency';
  idempotency: string;
};
type SetShoppingCartCacheAction = {
  type: 'set_shopping_cart_cache';
  shopping_cart_cache: ShoppingCartCache;
};
type ResetAction = {
  type: 'reset';
};
type SetCancelledAction = {
  type: 'set_cancelled';
  cancelled: boolean;
};
type SetRedirectStatusAction = {
  type: 'set_redirect_status';
  redirect_status?: MercadopagoPaymentStatus;
};
type SetErrorAction = {
  type: 'set_error';
  error?: Error;
};
type Action =
  | SetIdempotencyAction
  | SetShoppingCartCacheAction
  | ResetAction
  | SetCancelledAction
  | SetRedirectStatusAction
  | SetErrorAction;
type State = {
  idempotency?: string;
  shopping_cart_cache?: ShoppingCartCache;
  cancelled: boolean;
  redirect_status?: MercadopagoPaymentStatus;
  error?: Error;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_idempotency':
      return { ...state, idempotency: action.idempotency };
    case 'set_shopping_cart_cache':
      return { ...state, shopping_cart_cache: action.shopping_cart_cache };
    case 'reset':
      return {
        ...state,
        error: undefined,
        cancelled: false,
        redirect_status: undefined,
      };
    case 'set_cancelled':
      return { ...state, cancelled: action.cancelled };
    case 'set_redirect_status':
      return { ...state, redirect_status: action.redirect_status };
    case 'set_error':
      return { ...state, error: action.error };
    default:
      return state;
  }
};

interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  // params
  const store = route.params?.store as Store;
  if (!store) {
    throw new Error(`${prefix} Store param must be defined`);
  }
  const shopping_cart = route.params?.shopping_cart as ShoppingCartSnapshot;
  if (!shopping_cart) {
    throw new Error(`${prefix} Shopping cart param must be defined`);
  }
  // state
  const [state, dispatch] = useReducer(reducer, {
    cancelled: false,
  });
  const user = userCache.getData() as LoggedUser;
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const address = userCache.getAddress();
  if (!address) {
    throw new Error(`${prefix} User address must be defined`);
  }

  // event handlers
  const instanceCache = async () => {
    const cache = await shoppingCartsCache.get(store.id);
    dispatch({ type: 'set_shopping_cart_cache', shopping_cart_cache: cache });
  };

  const createPayment = async (idempotency: string, redirectUrl: string) => {
    if (fetchRequestSource) {
      fetchRequestSource.cancel();
    }
    fetchRequestSource = axios.CancelToken.source();
    const response = await paymentClient.create(
      {
        body: {
          customer: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            photo_url: user.photo_url,
            phone: user.phone,
          },
          transaction: {
            country: Constants.manifest.extra.BEAST_COUNTRY,
            currency: Constants.manifest.extra.BEAST_CURRENCY,
            language: Constants.manifest.extra.BEAST_LANGUAGE,
            delivery_address: address,
            shopping_cart: shopping_cart.items,
            store,
          },
          redirect_url: redirectUrl,
          payment_provider_id: PaymentProvider.MERCADOPAGO,
          dispatch_provider_id: DispatchProvider.OWNER,
        } as CreatePayment,
        idempotency,
        source: ['id', 'provider'],
      },
      fetchRequestSource.token
    );
    return response;
  };

  const openCheckout = async (idempotency: string) => {
    if (!redirectUrl) {
      throw new Error(`${prefix} Redirect url must be defined`);
    }

    try {
      dispatch({ type: 'reset' });
      const payment = await createPayment(idempotency, redirectUrl);
      if (payment.provider.status !== MercadopagoPaymentStatus.STARTED) {
        dispatch({
          type: 'set_redirect_status',
          redirect_status: payment.provider.status,
        });
        return;
      }

      // open checkout
      const result = await WebBrowser.openAuthSessionAsync(
        payment.provider.checkout.init_point,
        redirectUrl
      );

      if (result.type === 'success') {
        const redirectData = Linking.parse(result.url);
        if (redirectData?.queryParams?.status === 'not_mapped') {
          throw new Error(
            `${prefix} Redirect status no mapped, data: ${JSON.stringify(
              redirectData?.queryParams
            )}`
          );
        }
        if (redirectData?.queryParams?.status) {
          dispatch({
            type: 'set_redirect_status',
            redirect_status: redirectData.queryParams
              .status as MercadopagoPaymentStatus,
          });
          return;
        }
      }
      dispatch({ type: 'set_cancelled', cancelled: true });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Open checkout error', error);

        dispatch({ type: 'set_error', error });
      }
    }
  };

  const retryHandler = () => {
    openCheckout(state.idempotency as string);
  };

  const retryNewPaymentHandler = () => {
    dispatch({ type: 'set_idempotency', idempotency: generatePushID() });
  };

  const pressContinueHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: 'MainTab' }],
      })
    );
  };

  const requestNotificationPermisions = async () => {
    if (
      state.redirect_status &&
      [
        MercadopagoPaymentStatus.APPROVED,
        MercadopagoPaymentStatus.IN_PROCESS,
        MercadopagoPaymentStatus.PENDING,
      ].indexOf(state.redirect_status) !== -1
    ) {
      if (Constants.isDevice) {
        const { status: existingStatus } = await Permissions.getAsync(
          Permissions.NOTIFICATIONS
        );
        console.log(
          `${prefix} Notification permision current status, status ${existingStatus}`
        );
        if (existingStatus !== 'granted') {
          const { status } = await Permissions.askAsync(
            Permissions.NOTIFICATIONS
          );
          console.log(
            `${prefix} Notification permision status after request the user, status ${status}`
          );
        }
      }
    }
  };

  useEffect(() => {
    dispatch({ type: 'set_idempotency', idempotency: generatePushID() });
  }, []);

  useEffect(() => {
    instanceCache();
  }, []);

  useEffect(() => {
    if (state.idempotency) {
      openCheckout(state.idempotency);
    }
  }, [state.idempotency]);

  useEffect(() => {
    if (state.redirect_status && state.shopping_cart_cache) {
      if (store.payment_provider === PaymentProvider.MERCADOPAGO) {
        switch (state.redirect_status) {
          case MercadopagoPaymentStatus.APPROVED:
          case MercadopagoPaymentStatus.IN_PROCESS:
          case MercadopagoPaymentStatus.PENDING:
            state.shopping_cart_cache.clear();
            break;
          default:
            break;
        }
      }
    }
  }, [state.redirect_status, state.shopping_cart_cache]);

  useEffect(() => {
    requestNotificationPermisions();
  }, [state.redirect_status]);

  // render logic
  if (state.error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.white,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ErrorView onRetry={retryHandler} />
      </View>
    );
  }

  if (state.cancelled) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.white,
          justifyContent: 'center',
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <BrokenCardImage />
          <Text
            level={1}
            weight="bold"
            style={{ marginTop: 25, marginBottom: 10 }}
          >
            ¡Ups!
          </Text>
          <Text
            level={5}
            style={{
              lineHeight: 23,
              textAlign: 'center',
              marginHorizontal: 20,
            }}
          >
            Al parecer haz cancelado, si el pago se realizó te notificaremos.
          </Text>
          <Button
            type="link"
            title="Reintentar"
            style={{ marginTop: 50 }}
            onPress={retryNewPaymentHandler}
          />
        </View>

        <View
          style={[
            { position: 'absolute', left: 0, right: 0, bottom: 0 },
            globalStyles.withMargin,
          ]}
        >
          <Button
            title="Continuar"
            style={globalStyles.withMainActionAir}
            onPress={pressContinueHandler}
          />
        </View>
      </View>
    );
  }

  if (store.payment_provider === PaymentProvider.MERCADOPAGO) {
    switch (state.redirect_status) {
      case MercadopagoPaymentStatus.APPROVED:
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: colors.white,
              justifyContent: 'center',
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <CheckBlueThinImage />
              <Text
                level={1}
                weight="bold"
                style={{ marginTop: 25, marginBottom: 10 }}
              >
                ¡Listo!
              </Text>
              <Text
                level={5}
                style={{
                  lineHeight: 23,
                  textAlign: 'center',
                  marginHorizontal: 20,
                }}
              >
                Te notificaremos cuando{' '}
                <Text level={5} weight="bold">
                  {store.name}
                </Text>{' '}
                confirme y esté en camino.
              </Text>
            </View>

            <View
              style={[
                { position: 'absolute', left: 0, right: 0, bottom: 0 },
                globalStyles.withMargin,
              ]}
            >
              <Button
                title="Continuar"
                style={globalStyles.withMainActionAir}
                onPress={pressContinueHandler}
              />
            </View>
          </View>
        );
      case MercadopagoPaymentStatus.IN_PROCESS:
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: colors.white,
              justifyContent: 'center',
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <SearchingCardImage />
              <Text
                level={1}
                weight="bold"
                style={{
                  marginTop: 25,
                  marginBottom: 10,
                }}
              >
                ¡Casi listo!
              </Text>
              <Text
                level={5}
                style={{
                  lineHeight: 23,
                  textAlign: 'center',
                  marginHorizontal: 20,
                }}
              >
                El pago está en proceso, te notificaremos cuando este listo.
              </Text>
            </View>

            <View
              style={[
                { position: 'absolute', left: 0, right: 0, bottom: 0 },
                globalStyles.withMargin,
              ]}
            >
              <Button
                title="Continuar"
                style={globalStyles.withMainActionAir}
                onPress={pressContinueHandler}
              />
            </View>
          </View>
        );
      case MercadopagoPaymentStatus.PENDING:
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: colors.white,
              justifyContent: 'center',
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <RapidCashImage />
              <Text
                level={1}
                weight="bold"
                style={{ marginTop: 25, marginBottom: 10 }}
              >
                ¡Solo falta un paso!
              </Text>
              <Text
                level={5}
                style={{
                  lineHeight: 23,
                  textAlign: 'center',
                  marginHorizontal: 20,
                }}
              >
                Revisa las instrucciones en tu correo para finalizar el pago.
              </Text>
            </View>

            <View
              style={[
                { position: 'absolute', left: 0, right: 0, bottom: 0 },
                globalStyles.withMargin,
              ]}
            >
              <Button
                title="Continuar"
                style={globalStyles.withMainActionAir}
                onPress={pressContinueHandler}
              />
            </View>
          </View>
        );
      case MercadopagoPaymentStatus.REJECTED:
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: colors.white,
              justifyContent: 'center',
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <BrokenCardImage />
              <Text
                level={1}
                weight="bold"
                style={{ marginTop: 25, marginBottom: 10 }}
              >
                ¡Ups!
              </Text>
              <Text
                level={5}
                style={{
                  lineHeight: 23,
                  textAlign: 'center',
                  marginHorizontal: 20,
                }}
              >
                Parece que ocurrió un problema con el pago.
              </Text>
              <Button
                type="link"
                title="Reintentar"
                style={{ marginTop: 50 }}
                onPress={retryNewPaymentHandler}
              />
            </View>
          </View>
        );
      default:
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: colors.white,
              justifyContent: 'center',
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text
                level={2}
                style={{ marginBottom: 15, width: 226, textAlign: 'center' }}
              >
                Conectando con{' '}
                <Text level={2} weight="bold">
                  MercadoPago
                </Text>
              </Text>
              <MercadoPagoImage />

              <Text
                level={5}
                style={{
                  marginTop: 15,
                  lineHeight: 23,
                  textAlign: 'center',
                  marginHorizontal: 20,
                  width: 270,
                }}
              >
                Allá podrás seleccionar el medio de pago que prefieras.
              </Text>
            </View>
          </View>
        );
    }
  }

  throw new Error(
    `${prefix} Payment provider not supported, provider: ${store.payment_provider}`
  );
};
