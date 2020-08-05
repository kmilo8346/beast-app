import React, { useState, useRef, useEffect } from 'react';
import { View, Image, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { CommonActions } from '@react-navigation/native';

// components
import {
  Text,
  InputSelectCard,
  Button,
  Touchable,
  Toast,
  IToast,
  LoadingOverlay,
  ILoadingOverlay,
} from '../../components';
// local components
import { ModalSecurityCode } from './components';
// clients
import shopClient from '../../clients/shop-client';
// containers
import UserProvider from '../../containers/user';
import CartProvider from '../../containers/cart';
import OrderProvider from '../../containers/order';
// libs
import numberFormatter from '../../lib/formatters/number-formatter';
import { generatePushID } from '../../lib/uuid';
import { createUrl } from '../../lib/utils';
// types
import { Card, PaymentMethod, Order } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[checkout screen]';

interface CheckoutProps {
  navigation: any;
}

export default ({ navigation }: CheckoutProps) => {
  // state
  const [modalConfirmationVisible, setModalConfirmationVisible] = useState(
    false
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [idempotency, setIdempotency] = useState<string | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);

  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();
  const currentAddress = user?.addresses.find(
    (address) => address.id === user.currentAddress
  );
  const cartContainer = CartProvider.useContainer();
  const shoppingCart = cartContainer.getCart();
  const stats = cartContainer.getStats();
  const orderContainer = OrderProvider.useContainer();

  let orders: Order[] | null = null;
  if (shopId) {
    orders = orderContainer.purchases((order) => {
      return (
        order.shopId === shopId &&
        [
          'payment_pending',
          'payment_in_process',
          'payment_rejected',
          'confirmation_pending',
        ].indexOf(order.status) !== -1
      );
    });
  }

  const toastRef = useRef<IToast>(null);
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);

  // preconditions
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  if (!currentAddress) {
    throw new Error(`${prefix} Current address must be defined`);
  }

  // event handlers
  const createShop = async (securityCode?: string) => {
    let paymentMethod: PaymentMethod = 'TO_AGREE';
    let paymentInfo;
    if (securityCode) {
      paymentMethod = 'CREDIT_CARD';
      paymentInfo = {
        securityCode,
        installments: 1,
      };
    }

    const response = await shopClient.create({
      body: {
        customer: {
          id: user.id,
          email: user.email as string,
          firstName: user.firstName as string,
          lastName: user.lastName,
          photoUrl: user.photoUrl as string,
          mercadoPagoCustomerId: user.customerId as string,
          phone: user.phone as string,
        },
        transaction: {
          country: 'CL',
          currency: 'CLP',
          language: 'ES',
          deliveryAddress: currentAddress,
          shoppingCart,
          paymentMethod,
          paymentInfo,
        },
      },
      idempotency: idempotency as string,
      source: ['id'],
    });
    return response.id as string;
  };
  const confirmHandler = async (securityCode?: string) => {
    setModalConfirmationVisible(false);
    try {
      setLoading(true);
      loadingOverlayRef.current?.show();
      const shopId = await createShop(securityCode);
      setShopId(shopId);
    } catch (error) {
      setLoading(false);
      loadingOverlayRef.current?.hide();
      toastRef.current?.show({
        message: 'Ocurrió un error procesando el pago',
        type: 'ERROR',
        expiration: 3,
      });
    }
  };
  const pressImageMapHandler = () => {
    Linking.openURL(
      createUrl(`${Constants.manifest.extra.GOOGLE_MAPS_URL}/search/`, {
        api: 1,
        query: `${currentAddress?.geometry.location.lat},${currentAddress?.geometry.location.lng}`,
        query_place_id: currentAddress?.id,
      })
    );
  };
  const pressPayHandler = () => {
    setModalConfirmationVisible(true);
  };
  const requestCloseHandler = () => {
    setModalConfirmationVisible(false);
  };
  useEffect(() => {
    setIdempotency(generatePushID());
  }, []);
  useEffect(() => {
    if (orders) {
      // orders length must be the shopping cart lenght
      if (orders.length < shoppingCart.length) {
        return;
      }

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        // processing not finished yet
        if (
          order.status === 'payment_pending' ||
          order.status === 'payment_in_process'
        ) {
          return;
        }
      }
      // clear current cart
      cartContainer.clear();
      // hide loading
      setLoading(false);
      loadingOverlayRef.current?.hide();
      // reset to home
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: 'MainTab' }],
        })
      );
    }
  }, [orders]);

  // render logic
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

        <InputSelectCard />

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
          disabled={loading}
          onPress={pressPayHandler}
          style={globalStyles.withMainActionAir}
        />
      </View>
      {modalConfirmationVisible && (
        <ModalSecurityCode
          card={currentCard as Card}
          onConfirm={confirmHandler}
          onRequestClose={requestCloseHandler}
        />
      )}
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
