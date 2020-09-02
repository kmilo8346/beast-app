import React, { ReactNode, useReducer, useRef } from 'react';
import { View, ScrollView, Image, GestureResponderEvent } from 'react-native';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import axios, { CancelTokenSource } from 'axios';

// components
import Text from '../../../components/text';
import Button from '../../../components/buttons/button';
import ButtonIcon from '../../../components/buttons/button-icon';
import Touchable from '../../../components/touchable';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../../components/loading-overlay';
import Toast, { IToast } from '../../../components/toast';
import Icon from '../../../components/icon';
import ActionSheetContact from '../../../components/modals/action-sheet-contact';
import HappyManImage from '../../../components/svgs/images/happy-man';
import CheckImage from '../../../components/svgs/images/check-blue';
import PhoneFilledDotsImage from '../../../components/svgs/icons/phone-filled-dots-blue';
import RouteBlueImage from '../../../components/svgs/icons/route-blue';

// local components
import Steps, { Step, StepStatus } from './components/steps';
import Item from './components/item';
// libs
import * as utils from '../../../lib/utils';
import numberFormatter from '../../../lib/formatters/number-formatter';
// clients
import orderClient from '../../../clients/order-client';
// containers
import storeCache from '../../../cache/store';
// types
import {
  Order,
  ProductConfirmation,
  OwnerDispatchStatus,
} from '../../../types';
// styles
import colors from '../../../styles/colors';
import globalStyles from '../../../styles';

// instaces outside component
const prefix = '[sale details screen]';
let fetchRequestSource: CancelTokenSource;
const steps: Step[] = [
  {
    key: OwnerDispatchStatus.CREATED,
    label: 'Por confirmar',
  },
  {
    key: OwnerDispatchStatus.CONFIRMED,
    label: 'En camino',
  },
  {
    key: OwnerDispatchStatus.DELIVERED,
    label: 'Entregado',
  },
];
type SaleDetailsView = 'DETAILS' | 'CONFIRMED' | 'DELIVERED';
type SetCollapsedAction = {
  type: 'set_collapsed';
  collapsed: boolean;
};
type SetContactAction = {
  type: 'set_contact';
  contact: boolean;
};
type ChangeViewAction = {
  type: 'change_view';
  view: SaleDetailsView;
};
type Action = SetCollapsedAction | SetContactAction | ChangeViewAction;
type State = {
  view: SaleDetailsView;
  collapsed: boolean;
  contact: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_collapsed':
      return { ...state, collapsed: action.collapsed };
    case 'set_contact':
      return { ...state, contact: action.contact };
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
    collapsed: true,
    contact: false,
  });
  const sale: Order = route.params.sale;
  if (!sale) {
    throw new Error(`${prefix} Sale must be defined`);
  }
  const store = storeCache.getData();
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }
  if (!store.delivery_area) {
    throw new Error(`${prefix} Store must have a delivery area`);
  }

  const toastRef = useRef<IToast>(null);
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);

  // event handlers
  const pressImageMapHandler = () => {
    Linking.openURL(
      utils.createUrl(`${Constants.manifest.extra.GOOGLE_MAPS_URL}/search/`, {
        api: 1,
        query: `${sale.transaction.delivery_address.geometry.location.lat},${sale.transaction.delivery_address.geometry.location.lng}`,
        query_place_id: sale.transaction.delivery_address.id,
      })
    );
  };
  const pressSeeRouteHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    Linking.openURL(
      utils.createUrl(`${Constants.manifest.extra.GOOGLE_MAPS_URL}/dir/`, {
        api: 1,
        origin: `${store.delivery_area?.center.geometry.location.lat},${store.delivery_area?.center.geometry.location.lng}`,
        origin_place_id: store.delivery_area?.center.id,
        destination: `${sale.transaction.delivery_address.geometry.location.lat},${sale.transaction.delivery_address.geometry.location.lng}`,
        destination_place_id: sale.transaction.delivery_address.id,
      })
    );
  };
  const pressCallClientHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_contact', contact: true });
  };
  const contactCloseHandler = () => {
    dispatch({ type: 'set_contact', contact: false });
  };
  const pressGoToStockVerificationHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('StockVerificaton', {
      sale,
    });
  };
  const pressExpandHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_collapsed', collapsed: false });
  };
  const pressCollapseHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_collapsed', collapsed: true });
  };
  const confirm = async () => {
    try {
      loadingOverlayRef.current?.show();
      if (fetchRequestSource) {
        fetchRequestSource.cancel();
      }
      fetchRequestSource = axios.CancelToken.source();
      await orderClient.action('confirm', {
        pathVars: {
          id: sale.id,
        },
        body: {
          provider: {
            confirmation: sale.provider.confirmation,
          },
        },
      });
      dispatch({ type: 'change_view', view: 'CONFIRMED' });
    } catch (error) {
      if (!axios.isCancel(error)) {
        // TODO: log error
        console.log(error);

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
  const deliver = async () => {
    try {
      loadingOverlayRef.current?.show();
      if (fetchRequestSource) {
        fetchRequestSource.cancel();
      }
      fetchRequestSource = axios.CancelToken.source();
      await orderClient.action('deliver', {
        pathVars: {
          id: sale.id,
        },
      });
      dispatch({ type: 'change_view', view: 'DELIVERED' });
    } catch (error) {
      if (!axios.isCancel(error)) {
        // TODO: log error
        console.log(error);

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
  const backToSales = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('MySales', {
      view: 'IN_PROGRESS',
      reload: true,
    });
  };

  // render logic
  const stats = utils.getStats(sale.transaction.shopping_cart);
  // current step status
  let status: StepStatus = 'finish';
  if (sale.provider.status === OwnerDispatchStatus.CREATED) {
    status = 'process';
    if (
      sale.provider.confirmation &&
      sale.provider.confirmation.length >= sale.transaction.shopping_cart.length
    ) {
      status = 'finish';
    }
  } else if (sale.provider.status === OwnerDispatchStatus.CONFIRMED) {
    status = 'process';
  }
  // delivery adddress map image
  const mapImageUrl = utils.createUrl(
    `${Constants.manifest.extra.GOOGLE_MAPS_API_URL}/staticmap`,
    {
      center: `${sale.transaction.delivery_address.geometry.location.lat},${sale.transaction.delivery_address.geometry.location.lng}`,
      zoom: 13,
      size: '140x105',
      scale: 2,
      format: 'png',
      markers: `icon:${Constants.manifest.extra.GOOGLE_MAPS_CUSTOM_MARKER}|scale:2|${sale.transaction.delivery_address.geometry.location.lat},${sale.transaction.delivery_address.geometry.location.lng}`,
      key: Constants.manifest.extra.GOOGLE_MAPS_API_KEY,
    }
  );
  // formmatted delivered address
  let deliveryAddress = `${sale.transaction.delivery_address.route.short_name} ${sale.transaction.delivery_address.street_number.short_name}`;
  if (sale.transaction.delivery_address.apartment) {
    deliveryAddress = `${deliveryAddress} · ${sale.transaction.delivery_address.apartment}`;
  }
  // distance from store to delivery address
  const distance = utils.distance(
    store.delivery_area.center.geometry.location.lat,
    store.delivery_area.center.geometry.location.lng,
    sale.transaction.delivery_address.geometry.location.lat,
    sale.transaction.delivery_address.geometry.location.lng,
    'K'
  );
  let distanceText = `A ${numberFormatter.humanizeDistance(
    distance
  )} de distancia`;
  if (distance === 0) {
    distanceText = 'En tu misma dirección';
  }
  // see route
  let seeRoute: ReactNode | null = (
    <Touchable
      style={{ flexDirection: 'row', alignItems: 'center' }}
      onPress={pressSeeRouteHandler}
    >
      <RouteBlueImage />
      <Text
        level={5}
        weight="bold"
        color={colors.blue}
        style={{ marginLeft: 3 }}
      >
        Ver ruta
      </Text>
      <Icon
        name="chevron-right"
        color={colors.blue}
        style={{ marginLeft: 3 }}
      />
    </Touchable>
  );
  if (distance === 0) {
    seeRoute = null;
  }

  // full name
  let fullName = sale.customer.first_name;
  if (sale.customer.last_name) {
    fullName = `${fullName} ${sale.customer.last_name}`;
  }

  // edit confirmation
  let editConfirmationButton = null;
  if (
    sale.provider.status === OwnerDispatchStatus.CREATED &&
    sale.provider.confirmation
  ) {
    editConfirmationButton = (
      <Button
        type="link"
        title="Editar stock"
        style={{ paddingHorizontal: 0 }}
        onPress={pressGoToStockVerificationHandler}
      />
    );
  }
  // products and collpase button
  let products = sale.transaction.shopping_cart;
  let collapseButton: ReactNode | null = (
    <ButtonIcon icon="chevron-up" onPress={pressCollapseHandler} />
  );
  if (state.collapsed) {
    products = products.slice(0, 3);
    collapseButton = (
      <ButtonIcon icon="chevron-down" onPress={pressExpandHandler} />
    );
  }
  if (sale.transaction.shopping_cart.length <= 3) {
    collapseButton = null;
  }
  // hash to easy search product confirmations
  const confirmationHash: { [key: string]: ProductConfirmation } = {};
  (sale.provider.confirmation || []).forEach((productConfirmation) => {
    confirmationHash[productConfirmation.id] = productConfirmation;
  });

  // main action
  let mainAction: ReactNode = (
    <>
      <Text
        level={7}
        color={colors.blackLight5}
        style={{ marginBottom: 10, textAlign: 'center' }}
      >
        Para continuar con la venta, verifiquemos que cuentas con todos los
        productos.
      </Text>
      <Button
        title="Ir a verificación de stock"
        style={globalStyles.withMainActionAir}
        onPress={pressGoToStockVerificationHandler}
      />
    </>
  );
  if (
    sale.provider.status === OwnerDispatchStatus.CREATED &&
    sale.provider.confirmation &&
    sale.provider.confirmation.length >= sale.transaction.shopping_cart.length
  ) {
    mainAction = (
      <Button
        title="¡Listo! confirmar"
        style={globalStyles.withMainActionAir}
        onPress={confirm}
      />
    );
  } else if (sale.provider.status === OwnerDispatchStatus.CONFIRMED) {
    mainAction = (
      <Button
        title="¡Listo! entregado"
        style={globalStyles.withMainActionAir}
        onPress={deliver}
      />
    );
  } else if (sale.provider.status === OwnerDispatchStatus.DELIVERED) {
    mainAction = null;
  }
  let content: ReactNode | null = null;
  switch (state.view) {
    case 'CONFIRMED':
      content = (
        <View
          style={[
            { flex: 1, paddingTop: 70, alignItems: 'center' },
            globalStyles.withPadding,
          ]}
        >
          <View style={{ flex: 1 }} />
          <CheckImage />
          <Text
            level={1}
            weight="bold"
            style={{ marginTop: 30, textAlign: 'center', alignSelf: 'center' }}
          >
            ¡Listo! confirmaste la venta
          </Text>
          <Text
            level={3}
            style={{ marginTop: 15, textAlign: 'center', alignSelf: 'center' }}
          >
            Ahora puedes ir a entregar.
          </Text>
          <Steps
            current={OwnerDispatchStatus.CONFIRMED}
            status="process"
            steps={steps}
            style={{ marginTop: 35 }}
          />
          <View style={{ flex: 1 }} />
          <View
            style={[
              { position: 'absolute', left: 0, right: 0, bottom: 0 },
              globalStyles.withMargin,
            ]}
          >
            <Button
              title="Continuar"
              onPress={backToSales}
              style={globalStyles.withMainActionAir}
            />
          </View>
        </View>
      );
      break;
    case 'DELIVERED':
      content = (
        <View
          style={[
            { flex: 1, alignItems: 'center', justifyContent: 'center' },
            globalStyles.withPadding,
          ]}
        >
          <View style={{ flex: 1 }} />
          <HappyManImage />
          <Text
            level={1}
            weight="bold"
            style={{ marginTop: 30, textAlign: 'center', alignSelf: 'center' }}
          >
            ¡Genial! vamos por más.
          </Text>
          <View style={{ flex: 1 }} />
          <View
            style={[
              { position: 'absolute', left: 0, right: 0, bottom: 0 },
              globalStyles.withMargin,
            ]}
          >
            <Button
              title="Volver a ventas"
              onPress={backToSales}
              style={globalStyles.withMainActionAir}
            />
          </View>
        </View>
      );
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

              <View style={{ flex: 1, marginLeft: 15, paddingTop: 2 }}>
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
                  style={{ marginBottom: 7 }}
                >
                  {distanceText}
                </Text>
                {seeRoute}
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
            </View>

            <Touchable
              style={{
                backgroundColor: colors.blueLight3,
                borderWidth: 1,
                borderColor: colors.blueLight5,
                borderRadius: 8,
                paddingHorizontal: 20,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 20,
              }}
              onPress={pressCallClientHandler}
            >
              <PhoneFilledDotsImage />
              <Text
                level={5}
                weight="bold"
                color={colors.blue}
                style={{ marginLeft: 15 }}
              >
                Contactar a cliente
              </Text>
            </Touchable>

            <View style={{ marginTop: 30 }}>
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
                const productConfirmation = confirmationHash[product.id];
                return (
                  <Item
                    key={product.id}
                    product={product}
                    productConfirmation={productConfirmation}
                  />
                );
              })}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                {collapseButton}
              </View>
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
                  {numberFormatter.toCurrency(stats.ammount)}
                </Text>
              </View>
            </View>

            <View style={globalStyles.withScreenAir} />
          </ScrollView>
          <View
            style={[
              {
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: colors.white,
              },
              globalStyles.withMargin,
            ]}
          >
            <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
            {mainAction}
          </View>
        </View>
      );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      {content}
      <LoadingOverlay ref={loadingOverlayRef} />
      {state.contact && (
        <ActionSheetContact
          phone={sale.customer.phone}
          onRequestClose={contactCloseHandler}
        />
      )}
    </View>
  );
};
