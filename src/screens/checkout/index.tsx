import React, { useState, useRef } from 'react';
import { View, Image, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { CommonActions } from '@react-navigation/native';

// components
import {
  Container,
  Text,
  InputSelectCard,
  Button,
  Touchable,
  Toast,
  IToast,
} from '../../components';
// local components
import { ModalSecurityCode } from './components';
// containers
import UserProvider from '../../containers/user';
import CartProvider from '../../containers/cart';
// libs
import numberFormatter from '../../lib/formatters/number-formatter';
// types
import { Card } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

const createUrl = (url: string, params: { [key: string]: any }) => {
  let createdUrl = url;
  Object.keys(params).forEach((key, index) => {
    let separator = '&';
    if (index === 0) {
      separator = '?';
    }
    createdUrl = `${createdUrl}${separator}${key}=${encodeURIComponent(
      params[key]
    )}`;
  });
  return createdUrl;
};
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface CheckoutProps {
  navigation: any;
}

export default ({ navigation }: CheckoutProps) => {
  // state
  const [modalConfirmationVisible, setModalConfirmationVisible] = useState(
    false
  );
  const [loading, setLoading] = useState(false);
  const userContainer = UserProvider.useContainer();
  const currentAddress = userContainer.getCurrentAddress();
  const currentCard = userContainer.getCurrentCard();
  const cartContainer = CartProvider.useContainer();
  const stats = cartContainer.getStats();
  const toastRef = useRef<IToast>(null);

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
  const pressPayHandler = () => {
    setModalConfirmationVisible(true);
  };
  const confirmHandler = async (securityCode?: string) => {
    setModalConfirmationVisible(false);
    try {
      setLoading(true);
      await sleep(5000);
      cartContainer.clear();
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: 'MainTab' }],
        })
      );
    } catch (error) {
      toastRef.current?.show({
        message: 'Ocurrió un error procesando el pago',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      setLoading(false);
    }
  };
  const requestCloseHandler = () => {
    setModalConfirmationVisible(false);
  };

  // render logic
  return (
    <Container>
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
          loading={loading}
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
    </Container>
  );
};
