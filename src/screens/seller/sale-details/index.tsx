import React, { ReactNode, useReducer, useRef } from 'react';
import { View, ScrollView, Image, GestureResponderEvent } from 'react-native';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import axios, { CancelTokenSource } from 'axios';

// components
import {
  Text,
  Button,
  Touchable,
  ButtonIcon,
  LoadingOverlay,
  IToast,
  ILoadingOverlay,
  Toast,
} from '../../../components';
// local components
import { Steps, Step, StepStatus } from './components';
// libs
import * as utils from '../../../lib/utils';
import numberFormatter from '../../../lib/formatters/number-formatter';
// clients
// import orderClient from '../../../clients/order-client';
// containers
import UserProvider from '../../../containers/user';
// types
import { Order } from '../../../types';
// styles
import colors from '../../../styles/colors';
import globalStyles from '../../../styles';

const markerImage = require('../../../../assets/icons/marker.png');

// instaces outside component
const prefix = '[sale details screen]';
let fetchRequestSource: CancelTokenSource;
const steps: Step[] = [
  {
    key: 'confirmation_pending',
    label: 'Por confirmar',
  },
  {
    key: 'in_delivery',
    label: 'En camino',
  },
  {
    key: 'delivered',
    label: 'Entregado',
  },
];
type SaleDetailsView = 'DETAILS' | 'CONFIRMED' | 'DELIVERED';
type SetCollapsedAction = {
  type: 'set_collapsed';
  collapsed: boolean;
};
type ChangeViewAction = {
  type: 'change_view';
  view: SaleDetailsView;
};
type Action = SetCollapsedAction | ChangeViewAction;
type State = {
  view: SaleDetailsView;
  collapsed: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_collapsed':
      return { ...state, collapsed: action.collapsed };
    case 'change_view':
      return { ...state, view: action.view };
    default:
      return state;
  }
};

export interface SaleDetailsProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: SaleDetailsProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    view: 'DETAILS',
    collapsed: false,
  });
  const sale: Order = route.params.sale;
  const userContainer = UserProvider.useContainer();
  const store = userContainer.getStore();
  const toastRef = useRef<IToast>(null);
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);

  // precondition
  if (!sale) {
    throw new Error(`${prefix} Sale must be defined`);
  }
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }
  if (!store.deliveryArea) {
    throw new Error(`${prefix} Store must have a delivery area`);
  }

  // event handlers
  const pressImageMapHandler = () => {
    Linking.openURL(
      utils.createUrl(`${Constants.manifest.extra.GOOGLE_MAPS_URL}/search/`, {
        api: 1,
        query: `${sale.transaction.deliveryAddress.geometry.location.lat},${sale.transaction.deliveryAddress.geometry.location.lng}`,
        query_place_id: sale.transaction.deliveryAddress.id,
      })
    );
  };
  const pressGoToStockVerificationHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('StockVerificaton', {
      sale,
    });
  };
  const confirm = async () => {
    try {
      loadingOverlayRef.current?.show();
      if (fetchRequestSource) {
        fetchRequestSource.cancel();
      }
      fetchRequestSource = axios.CancelToken.source();
      await utils.sleep(3000);
      dispatch({ type: 'change_view', view: 'CONFIRMED' });
    } catch (error) {
      if (!axios.isCancel(error)) {
        toastRef.current?.show({
          message: 'Ocurrió un error inesperado, reintente',
          type: 'ERROR',
          expiration: 3,
        });
      }
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };
  const setDelivered = async () => {
    try {
      loadingOverlayRef.current?.show();
      if (fetchRequestSource) {
        fetchRequestSource.cancel();
      }
      fetchRequestSource = axios.CancelToken.source();
      await utils.sleep(3000);
      dispatch({ type: 'change_view', view: 'DELIVERED' });
    } catch (error) {
      if (!axios.isCancel(error)) {
        toastRef.current?.show({
          message: 'Ocurrió un error inesperado, reintente',
          type: 'ERROR',
          expiration: 3,
        });
      }
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  // render logic

  // current step status
  let status: StepStatus = 'finish';
  if (sale.status === 'confirmation_pending') {
    status = 'process';
    if (sale.confirmation?.status === 'finished') {
      status = 'finish';
    }
  } else if (sale.status === 'in_delivery') {
    status = 'process';
  }
  // delivery adddress map image
  const mapImageUrl = utils.createUrl(
    `${Constants.manifest.extra.GOOGLE_MAPS_API_URL}/staticmap`,
    {
      center: `${sale.transaction.deliveryAddress.geometry.location.lat},${sale.transaction.deliveryAddress.geometry.location.lng}`,
      zoom: 13,
      size: '140x105',
      scale: 2,
      format: 'png',
      markers: `icon:${Constants.manifest.extra.GOOGLE_MAPS_CUSTOM_MARKER}|scale:2|${sale.transaction.deliveryAddress.geometry.location.lat},${sale.transaction.deliveryAddress.geometry.location.lng}`,
      key: Constants.manifest.extra.GOOGLE_MAPS_API_KEY,
    }
  );
  // formmatted delivered address
  let deliveryAddress = `${sale.transaction.deliveryAddress.route.shortName} ${sale.transaction.deliveryAddress.streetNumber.shortName}`;
  if (sale.transaction.deliveryAddress.apartment) {
    deliveryAddress = `${deliveryAddress} · ${sale.transaction.deliveryAddress.apartment}`;
  }
  // distance from store to delivery address
  const distance = utils.distance(
    store.deliveryArea.center.geometry.location.lat,
    store.deliveryArea.center.geometry.location.lng,
    sale.transaction.deliveryAddress.geometry.location.lat,
    sale.transaction.deliveryAddress.geometry.location.lng,
    'K'
  );
  const distanceText = `A ${numberFormatter.humanizeDistance(
    distance
  )} de distancia`;
  // full name
  let fullName = sale.customer.firstName;
  if (sale.customer.lastName) {
    fullName = `${fullName} ${sale.customer.lastName}`;
  }
  // payment method
  let paymentMethod = 'A convenir';
  if (sale.transaction.paymentMethod === 'CREDIT_CARD') {
    paymentMethod = 'Con tarjeta';
  }
  // show route to customer
  let showRoute = null;
  if (sale.status === 'in_delivery') {
    showRoute = (
      <Touchable
        style={{
          backgroundColor: colors.blueLight3,
          borderWidth: 1,
          borderColor: colors.blueLight1,
          borderRadius: 13,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 15,
          paddingVertical: 10,
          marginTop: 15,
        }}
      >
        <Image source={markerImage} />
        <Text
          level={5}
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginLeft: 15 }}
        >
          Ver dirección en mapa
        </Text>
      </Touchable>
    );
  }
  // edit confirmation
  let editConfirmationButton = null;
  if (sale.status === 'confirmation_pending' && sale.confirmation) {
    editConfirmationButton = (
      <Button
        type="link"
        title="Editar stock"
        style={{ paddingHorizontal: 0 }}
      />
    );
  }
  let products = sale.transaction.shoppingCart;
  let collapseButton: ReactNode | null = <ButtonIcon icon="chevron-up" />;
  if (state.collapsed) {
    products = products.slice(0, 3);
    collapseButton = <ButtonIcon icon="chevron-down" />;
  }
  if (sale.transaction.shoppingCart.length <= 3) {
    collapseButton = null;
  }

  let content: ReactNode | null = null;
  switch (state.view) {
    case 'CONFIRMED':
      content = <View style={{ flex: 1 }} />;
      break;
    case 'DELIVERED':
      content = <View style={{ flex: 1 }} />;
      break;
    default:
      content = (
        <View style={{ flex: 1 }}>
          <ScrollView style={[{ flex: 1 }, globalStyles.withPadding]}>
            <Steps
              current={sale.status}
              status={status}
              steps={steps}
              style={{ marginTop: 10 }}
            />

            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <Touchable onPress={pressImageMapHandler}>
                <Image
                  source={{
                    uri: mapImageUrl,
                  }}
                  style={{ width: 140, height: 105, borderRadius: 13 }}
                />
              </Touchable>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text
                  level={6}
                  color={colors.blackLight4}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ marginTop: 3, marginBottom: 7 }}
                >
                  Dirección de entrega
                </Text>
                <Text
                  level={6}
                  weight="bold"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={{ marginBottom: 7, lineHeight: 20 }}
                >
                  {deliveryAddress}
                </Text>
                <Text
                  level={6}
                  color={colors.blackLight4}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {distanceText}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 25 }}>
              <View style={{ flex: 1 }}>
                <Text
                  level={6}
                  color={colors.blackLight4}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ marginBottom: 10 }}
                >
                  Nombre cliente
                </Text>
                <Text
                  level={6}
                  weight="bold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {fullName}
                </Text>
              </View>
              <View style={{ width: 15 }} />
              <View style={{ flex: 1 }}>
                <Text
                  level={6}
                  color={colors.blackLight4}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ marginBottom: 10 }}
                >
                  Método de pago
                </Text>
                <Text
                  level={6}
                  weight="bold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {paymentMethod}
                </Text>
              </View>
            </View>

            {showRoute}

            <View style={{ marginTop: 20 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text
                  level={4}
                  weight="bold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ flex: 1 }}
                >
                  Resumen de productos
                </Text>
                <View style={{ width: 2 }} />
                {editConfirmationButton}
              </View>

              <View
                style={{
                  height: 1,
                  backgroundColor: colors.blackLight6,
                  marginTop: 15,
                  marginBottom: 15,
                }}
              />

              {products.map((product) => {
                return (
                  <View
                    key={product.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 5,
                    }}
                  >
                    <View
                      style={{
                        borderWidth: 2,
                        borderColor: colors.blackLight4,
                        borderRadius: 4,
                        paddingVertical: 3,
                        paddingHorizontal: 5,
                        minWidth: 25,
                        minHeight: 25,
                        alignItems: 'center',
                      }}
                    >
                      <Text level={6}>{product.qty}</Text>
                    </View>
                    <Text
                      level={6}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={{ flex: 1, marginLeft: 10 }}
                    >
                      {product.name}
                    </Text>
                    <Text level={6} style={{ marginLeft: 10 }}>
                      {numberFormatter.toCurrency(product.qty * product.price)}
                    </Text>
                  </View>
                );
              })}
              <View style={{ alignItems: 'center' }}>{collapseButton}</View>
              <View
                style={{
                  height: 1,
                  backgroundColor: colors.blackLight6,
                  marginTop: 5,
                  marginBottom: 20,
                }}
              />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text level={5} weight="bold">
                  Total
                </Text>
                <Text level={3} weight="bold">
                  {numberFormatter.toCurrency(sale.transaction.stats.ammount)}
                </Text>
              </View>
            </View>

            <View style={globalStyles.withScreenAir} />
          </ScrollView>
          <View
            style={[
              { position: 'absolute', left: 0, right: 0, bottom: 0 },
              globalStyles.withMargin,
            ]}
          >
            <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
            <Text
              level={7}
              color={colors.blackLight5}
              style={{ marginBottom: 10, textAlign: 'center' }}
            >
              Para continuar con la venta, verifiquemos que cuentas con todos
              los productos.
            </Text>
            <Button
              title="Ir a verificación de stock"
              style={globalStyles.withMainActionAir}
              onPress={pressGoToStockVerificationHandler}
            />
          </View>
        </View>
      );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      {content}
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
