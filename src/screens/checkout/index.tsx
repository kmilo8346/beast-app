import React, { useReducer, useEffect, ReactNode } from 'react';
import { View, GestureResponderEvent, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';
import axios, { CancelTokenSource } from 'axios';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
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
// screen components
import InfoDialog from '../components/dialogs/info-dialog';
// local components
import UnavailableProductsDialog from './components/unavailable-products-dialog';
// clients
import paymentClient from '../../clients/payment-client';
// types
import {
  MercadopagoPaymentStatus,
  LoggedUser,
  PaymentProvider,
  DispatchProvider,
  CreatePayment,
  Product,
} from '../../types';
// cache
import userCache from '../../cache/user';
import shoppingCartCache, {
  StoreShoppingCartSnapshot,
} from '../../cache/shopping-cartv2';
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
type SetClosedStoreDialogAction = {
  type: 'set_closed_store_dialog';
  closed_store_dialog: boolean;
};
type ShowUnavailableProductsDialogAction = {
  type: 'show_unavailable_products_dialog';
  unavailable_products: Product[];
};
type HideUnavailableProductsDialogAction = {
  type: 'hide_unavailable_products_dialog';
};
type Action =
  | SetIdempotencyAction
  | ResetAction
  | SetCancelledAction
  | SetRedirectStatusAction
  | SetErrorAction
  | SetClosedStoreDialogAction
  | ShowUnavailableProductsDialogAction
  | HideUnavailableProductsDialogAction;
type State = {
  idempotency?: string;
  cancelled: boolean;
  redirect_status?: MercadopagoPaymentStatus;
  error?: Error;
  closed_store_dialog: boolean;
  unavailable_products_dialog: boolean;
  unavailable_products: Product[];
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_idempotency':
      return { ...state, idempotency: action.idempotency };
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
    case 'set_closed_store_dialog':
      return { ...state, closed_store_dialog: action.closed_store_dialog };
    case 'show_unavailable_products_dialog':
      return {
        ...state,
        unavailable_products_dialog: true,
        unavailable_products: action.unavailable_products,
      };
    case 'hide_unavailable_products_dialog':
      return { ...state, unavailable_products_dialog: false };
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
  const store_snapshot = route.params
    ?.store_snapshot as StoreShoppingCartSnapshot;
  if (!store_snapshot) {
    throw new Error(`${prefix} Store snapshot param must be defined`);
  }
  // state
  const [state, dispatch] = useReducer(reducer, {
    cancelled: false,
    closed_store_dialog: false,
    unavailable_products_dialog: false,
    unavailable_products: [],
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
            shopping_cart: store_snapshot.items,
            store: store_snapshot.store,
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
        redirectUrl,
        { showInRecents: true }
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

        if (error.response?.status === 400 && error.response.data.reason) {
          if (error.response.data.reason === 'SHOP_CLOSED') {
            dispatch({
              type: 'set_closed_store_dialog',
              closed_store_dialog: true,
            });
            return;
          }
          if (error.response.data.reason === 'PRODUCTS_NOT_AVAILABLE') {
            dispatch({
              type: 'show_unavailable_products_dialog',
              unavailable_products: error.response.data.meta_data.products,
            });
            return;
          }
        }
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
    navigation.navigate('Home');
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

        if (existingStatus !== 'granted') {
          await Permissions.askAsync(Permissions.NOTIFICATIONS);
        }
      }
    }
  };

  const closedStoreDialogOkHandler = () => {
    dispatch({ type: 'set_closed_store_dialog', closed_store_dialog: false });
    navigation.goBack();
  };

  const unavailableProductsDialogOkHandler = () => {
    // delete unavailables from shopping cart
    state.unavailable_products.forEach((product) => {
      shoppingCartCache.set(store_snapshot.store, product, 0);
    });
    dispatch({ type: 'hide_unavailable_products_dialog' });
    setImmediate(() => {
      navigation.goBack();
    });
  };

  const unavailableProductsDialogCancelHandler = () => {
    dispatch({ type: 'hide_unavailable_products_dialog' });
    setImmediate(() => {
      navigation.goBack();
    });
  };

  useEffect(() => {
    dispatch({ type: 'set_idempotency', idempotency: generatePushID() });
  }, []);

  useEffect(() => {
    if (state.idempotency) {
      openCheckout(state.idempotency);
    }
  }, [state.idempotency]);

  useEffect(() => {
    if (state.redirect_status) {
      if (
        store_snapshot.store.payment_provider === PaymentProvider.MERCADOPAGO
      ) {
        switch (state.redirect_status) {
          case MercadopagoPaymentStatus.APPROVED:
          case MercadopagoPaymentStatus.IN_PROCESS:
          case MercadopagoPaymentStatus.PENDING:
            shoppingCartCache.clearStore(store_snapshot.store.id);
            break;
          default:
            break;
        }
      }
    }
  }, [state.redirect_status]);

  useEffect(() => {
    requestNotificationPermisions();
  }, [state.redirect_status]);

  // render logic
  let content: ReactNode = null;
  if (state.error) {
    content = (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ErrorView onRetry={retryHandler} />
      </View>
    );
  } else if (state.cancelled) {
    content = (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
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
          Al parecer cerraste la ventana de pago, si el cobro se realizó tu
          pedido estará en curso.
        </Text>
        <Button
          type="link"
          title="Reintentar"
          style={{ marginTop: 50 }}
          onPress={retryNewPaymentHandler}
        />

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
  } else if (
    store_snapshot.store.payment_provider === PaymentProvider.MERCADOPAGO
  ) {
    switch (state.redirect_status) {
      case MercadopagoPaymentStatus.APPROVED:
        content = (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
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
                {store_snapshot.store.name}
              </Text>{' '}
              confirme y esté en camino.
            </Text>

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
        break;
      case MercadopagoPaymentStatus.IN_PROCESS:
        content = (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
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
        break;
      case MercadopagoPaymentStatus.PENDING:
        content = (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
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
        break;
      case MercadopagoPaymentStatus.REJECTED:
        content = (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
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
        );
        break;
      default:
        content = (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
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
            <ActivityIndicator />
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
        );
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.white,
      }}
    >
      {content}
      {state.closed_store_dialog && (
        <InfoDialog
          title="Tienda cerrada momentáneamente"
          message={`${store_snapshot.store.name} ya no está aceptando pedidos. Revisa su horario e intenta más tarde.`}
          onOk={closedStoreDialogOkHandler}
        />
      )}
      {state.unavailable_products_dialog && (
        <UnavailableProductsDialog
          products={state.unavailable_products}
          onOk={unavailableProductsDialogOkHandler}
          onCancel={unavailableProductsDialogCancelHandler}
        />
      )}
    </View>
  );
};
