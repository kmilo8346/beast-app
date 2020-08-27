import React, { useRef, useEffect, useReducer } from 'react';
import { View, Image, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// components
import Text from '../../components/text';
import Button from '../../components/buttons/button';
import Touchable from '../../components/touchable';
import Toast, { IToast } from '../../components/toast';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../components/loading-overlay';
// clients
import paymentClient from '../../clients/payment-client';
// containers
import UserProvider from '../../containers/user';
import CartProvider from '../../containers/cart';
// libs
import numberFormatter from '../../lib/formatters/number-formatter';
import { generatePushID } from '../../lib/uuid';
import { createUrl } from '../../lib/utils';
// types
import { MercadopagoPaymentStatus } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[checkout screen]';

export enum CheckoutView {
  FORM = 'form',
  PENDING = 'pending',
  IN_PROCESS = 'in_process',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
type SetIdempotencyAction = {
  type: 'set_idempotency';
  idempotency: string;
};
type ChangeViewAction = {
  type: 'change_view';
  view: CheckoutView;
};

type Action = SetIdempotencyAction | ChangeViewAction;
type State = {
  view: CheckoutView;
  idempotency?: string;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_idempotency':
      return { ...state, idempotency: action.idempotency };
    case 'change_view':
      return { ...state, view: action.view };
    default:
      return state;
  }
};

interface CheckoutProps {
  navigation: any;
}

export default ({ navigation }: CheckoutProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    view: CheckoutView.FORM,
  });
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const currentAddress = user.addresses.find(
    (address) => address.id === user.currentAddress
  );
  if (!currentAddress) {
    throw new Error(`${prefix} Current address must be defined`);
  }
  const cartContainer = CartProvider.useContainer();
  const cart = cartContainer.getCart();
  const shoppingCart = cart[0].data;
  const store = cart[0].store;
  const stats = cartContainer.getStats();

  const toastRef = useRef<IToast>(null);
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);

  // event handlers
  const pressImageMapHandler = () => {
    Linking.openURL(
      createUrl(`${Constants.manifest.extra.GOOGLE_MAPS_URL}/search/`, {
        api: 1,
        query: `${currentAddress?.geometry.location.lat},${currentAddress?.geometry.location.lng}`,
        query_place_id: currentAddress?.id,
      })
    );
  };
  const showView = (status: string) => {
    switch (status) {
      case 'pending':
        dispatch({
          type: 'change_view',
          view: CheckoutView.PENDING,
        });
        return;
      case 'in_process':
        dispatch({
          type: 'change_view',
          view: CheckoutView.IN_PROCESS,
        });
        return;
      case 'approved':
        dispatch({
          type: 'change_view',
          view: CheckoutView.APPROVED,
        });
        return;
      case 'rejected':
        dispatch({
          type: 'change_view',
          view: CheckoutView.REJECTED,
        });
        return;
      default:
        dispatch({
          type: 'change_view',
          view: CheckoutView.FORM,
        });
    }
  };
  const openCheckout = async (initPoint: string, redirectUrl: string) => {
    const result = await WebBrowser.openAuthSessionAsync(
      initPoint,
      redirectUrl
    );
    let redirect: any = {
      id: '',
      status: '',
    };
    if (result.type === 'success') {
      const redirectData = Linking.parse(result.url);
      redirect = redirectData.queryParams;
    }
    return redirect;
  };
  const createPayment = async (redirectUrl: string) => {
    const response = await paymentClient.create({
      body: {
        customer: {
          id: user.id,
          email: user.email as string,
          first_name: user.firstName as string,
          last_name: user.lastName,
          photo_url: user.photoUrl as string,
          phone: user.phone as string,
        },
        transaction: {
          country: Constants.manifest.extra.BEAST_COUNTRY,
          currency: Constants.manifest.extra.BEAST_CURRENCY,
          language: Constants.manifest.extra.BEAST_LANGUAGE,
          delivery_address: currentAddress,
          shopping_cart: shoppingCart,
          store,
        },
        redirect_url: redirectUrl,
      },
      idempotency: state.idempotency as string,
      source: ['id', 'provider'],
    });
    return response;
  };
  const pressPayHandler = async () => {
    try {
      loadingOverlayRef.current?.show();
      const redirectUrl = Linking.makeUrl();
      if (!redirectUrl) {
        throw new Error(`${prefix} Redirect must be defined`);
      }
      const payment = await createPayment(redirectUrl);

      // payment already processed
      if (payment.provider.status !== MercadopagoPaymentStatus.STARTED) {
        showView(payment.provider.status);
        return;
      }
      // open checkout
      const redirect = await openCheckout(
        payment.provider.checkout.initPoint,
        redirectUrl
      );
      showView(redirect.status as string);
    } catch (error) {
      // TODO: log error
      console.log(error);
      toastRef.current?.show({
        message: 'Ocurrió un error inesperado, por favor reintente',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  useEffect(() => {
    dispatch({ type: 'set_idempotency', idempotency: generatePushID() });
  }, []);

  // render logic
  if (state.view === CheckoutView.PENDING) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        <Text level={6} weight="bold">
          El pago se encuentra pendiente
        </Text>
      </View>
    );
  }

  if (state.view === CheckoutView.IN_PROCESS) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        <Text level={6} weight="bold">
          El pago se encuentra en processo. Le notificaremos cuando cambie
        </Text>
      </View>
    );
  }

  if (state.view === CheckoutView.APPROVED) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        <Text level={6} weight="bold">
          Su pago se procesó correctamente
        </Text>
      </View>
    );
  }

  if (state.view === CheckoutView.REJECTED) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        <Text level={6} weight="bold">
          Ocurrió un error procesando el pago
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={[{ flex: 1 }, globalStyles.withPadding]}>
        <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 20 }}>
          <Touchable onPress={pressImageMapHandler}>
            <Image
              source={{
                uri: createUrl(
                  `${Constants.manifest.extra.GOOGLE_MAPS_API_URL}/staticmap`,
                  {
                    center: `${currentAddress?.geometry.location.lat},${currentAddress?.geometry.location.lng}`,
                    zoom: 13,
                    size: '130x130',
                    scale: 2,
                    format: 'png',
                    markers: `icon:${Constants.manifest.extra.GOOGLE_MAPS_CUSTOM_MARKER}|scale:2|${currentAddress?.geometry.location.lat},${currentAddress?.geometry.location.lng}`,
                    key: Constants.manifest.extra.GOOGLE_MAPS_API_KEY,
                  }
                ),
              }}
              style={{ width: 130, height: 130, borderRadius: 10 }}
            />
          </Touchable>
          <View style={{ flex: 1, marginLeft: 20 }}>
            <Text
              level={5}
              numberOfLines={2}
              style={{
                marginTop: 10,
                lineHeight: 20,
                color: colors.blackLight3,
              }}
            >
              Tu compra llegará a la dirección
            </Text>
            <Text
              level={6}
              numberOfLines={2}
              style={{ marginTop: 10, lineHeight: 20 }}
            >
              {`${currentAddress?.route.shortName} ${currentAddress?.streetNumber.shortName}, ${currentAddress?.apartment}`}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 30 }}>
          {Object.keys(stats.byStores).map((storeId) => {
            const storeStats = stats.byStores[storeId];
            return (
              <View
                key={storeId}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <Text level={5}>{storeStats.name}</Text>
                <Text level={6}>
                  {numberFormatter.toCurrency(storeStats.ammount)}
                </Text>
              </View>
            );
          })}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 5,
            }}
          >
            <Text level={5} weight="bold">
              Total
            </Text>
            <Text level={6} weight="bold">
              {numberFormatter.toCurrency(stats.ammount)}
            </Text>
          </View>
        </View>
        <View style={globalStyles.withScreenAir} />
      </ScrollView>
      <View
        style={[
          { position: 'absolute', bottom: 0, left: 0, right: 0 },
          globalStyles.withMargin,
        ]}
      >
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Pagar"
          onPress={pressPayHandler}
          style={globalStyles.withMainActionAir}
        />
      </View>
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
