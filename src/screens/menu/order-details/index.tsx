import React, { ReactNode, useReducer, useRef } from 'react';
import { View, ScrollView, Image, GestureResponderEvent } from 'react-native';

// components
import Text from '../../../components/text';
import Divider from '../../../components/divider';
import ButtonIcon from '../../../components/buttons/button-icon';
import Icon from '../../../components/icon';
import Touchable from '../../../components/touchable';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../../components/loading-overlay';
import Toast, { IToast } from '../../../components/toast';
import ActionSheetContact from '../../../components/modals/action-sheet-contact';
import PhoneFilledDotsIcon from '../../../components/svgs/icons/phone-filled-dots-blue';
import MapPinShadedBlueIcon from '../../../components/svgs/icons/map-pin-shaded-blue';
// local components
import Steps, { Step, StepStatus } from '../../components/steps';
import Item from './components/item';
// libs
import * as utils from '../../../lib/utils';
import numberFormatter from '../../../lib/formatters/number-formatter';
import durationFormatter from '../../../lib/formatters/duration-formatter';
import cloudinary from '../../../lib/cloudinary';
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
const prefix = '[order details screen]';
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
type OrderDetailsView = 'DETAILS' | 'CONFIRMED' | 'DELIVERED';
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
  view: OrderDetailsView;
};
type Action = SetCollapsedAction | SetContactAction | ChangeViewAction;
type State = {
  view: OrderDetailsView;
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

export interface OrderDetailsProps {
  navigation: any;
  route: any;
}

export default ({ route }: OrderDetailsProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    view: 'DETAILS',
    collapsed: true,
    contact: false,
  });
  const order: Order = route.params.order;
  if (!order) {
    throw new Error(`${prefix} Order must be defined`);
  }
  // TODO: revisar esto
  const store = order.transaction.store;

  const toastRef = useRef<IToast>(null);
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);

  // event handlers
  const pressCallStoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_contact', contact: true });
  };
  const contactCloseHandler = () => {
    dispatch({ type: 'set_contact', contact: false });
  };
  const pressExpandHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_collapsed', collapsed: false });
  };
  const pressCollapseHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_collapsed', collapsed: true });
  };

  // render logic
  // estimated delivery time component
  let estimatedDeliveryTimeComponent: ReactNode | null = null;
  const stats = utils.getStats(order.transaction.shopping_cart);
  // current step status

  let statusComponent: ReactNode;
  if (order.dispatch_provider.status === OwnerDispatchStatus.CANCELLED) {
    statusComponent = (
      <View style={{}}>
        <Text level={3} color={colors.blackLight2} weight="bold">
          Pedido cancelado
        </Text>
        <View
          style={{
            marginLeft: 15,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 5,
            backgroundColor: colors.redLight3,
            alignSelf: 'flex-start',
            marginTop: 7,
          }}
        >
          <Text level={6} color={colors.redLight2}>
            Sin stock
          </Text>
        </View>
      </View>
    );
  } else {
    let status: StepStatus = 'finish';
    if (order.dispatch_provider.status === OwnerDispatchStatus.CREATED) {
      status = 'process';
      if (
        order.dispatch_provider.confirmation &&
        order.dispatch_provider.confirmation.product_confirmations.length >=
        order.transaction.shopping_cart.length
      ) {
        status = 'finish';
      }
    } else if (
      order.dispatch_provider.status === OwnerDispatchStatus.CONFIRMED
    ) {
      status = 'process';
      // estimated delivery time
      const durationToDeliver = durationFormatter.humanizeDurationToFinish(
        order.updated_at,
        order.transaction.store.delivery_time.lte,
        5
      );

      estimatedDeliveryTimeComponent = (
        <View
          style={{
            flexDirection: 'row',
            marginTop: 10,
            alignItems: 'center',
          }}
        >
          <Icon name="clock" color={colors.blue} />
          <Text level={6} style={{ marginLeft: 5 }} color={colors.blue}>
            Entrega en{' '}
            <Text level={6} weight="bold" color={colors.blue}>
              {durationToDeliver}
            </Text>
          </Text>
        </View>
      );
    }

    statusComponent = (
      <Steps
        current={order.status}
        status={status}
        steps={steps}
        style={{ marginTop: 10 }}
      />
    );
  }

  // distance from store to delivery address
  const distance = utils.distance(
    store.delivery_area.center.geometry.location.lat,
    store.delivery_area.center.geometry.location.lng,
    order.transaction.delivery_address.geometry.location.lat,
    order.transaction.delivery_address.geometry.location.lng,
    'K'
  );
  let distanceText = `A ${numberFormatter.humanizeDistance(
    distance
  )} de distancia`;
  if (distance === 0) {
    distanceText = 'En tu misma dirección';
  }

  // address text
  let addressText = `${order.transaction.delivery_address.route.short_name} ${order.transaction.delivery_address.street_number.short_name}`;
  if (order.transaction.delivery_address.apartment) {
    addressText = `${addressText} · ${order.transaction.delivery_address.apartment}`;
  }

  // products and collpase button
  let products = order.transaction.shopping_cart;
  let collapseButton: ReactNode | null = (
    <ButtonIcon icon="chevron-up" onPress={pressCollapseHandler} />
  );
  if (state.collapsed) {
    products = products.slice(0, 3);
    collapseButton = (
      <ButtonIcon icon="chevron-down" onPress={pressExpandHandler} />
    );
  }
  if (order.transaction.shopping_cart.length <= 3) {
    collapseButton = null;
  }
  // hash to easy search product confirmations
  const confirmationHash: { [key: string]: ProductConfirmation } = {};
  (order.dispatch_provider.confirmation?.product_confirmations || []).forEach(
    (productConfirmation) => {
      confirmationHash[productConfirmation.id] = productConfirmation;
    }
  );

  const content: ReactNode | null = (
    <View style={{ flex: 1 }}>
      <ScrollView style={[{ flex: 1 }]}>
        <View style={globalStyles.withPadding}>
          {statusComponent}
          {estimatedDeliveryTimeComponent}
        </View>
        <Divider type="thick" style={{ marginTop: 20 }} />
        <View style={globalStyles.withPadding}>
          <View style={{ flexDirection: 'row', marginTop: 20 }}>
            <Image
              source={{
                uri: cloudinary.dynamicUrl(store.images[0], 'w_100'),
              }}
              style={{
                height: 50,
                width: 50,
                borderRadius: 10,
              }}
            />

            <View style={{ flex: 1, marginLeft: 15, paddingTop: 2 }}>
              <Text
                level={4}
                weight="bold"
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{ marginBottom: 7, lineHeight: 20 }}
              >
                {store.name}
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
            </View>
          </View>
        </View>
        <Divider type="thick" style={{ marginTop: 20 }} />

        <View style={globalStyles.withPadding}>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 25,
              alignItems: 'center',
            }}
          >
            <MapPinShadedBlueIcon />
            <View style={{ flex: 1, marginLeft: 20 }}>
              <Text
                level={5}
                numberOfLines={1}
                weight="bold"
                style={{ marginBottom: 10 }}
              >
                Dirección de entrega
              </Text>
              <Text level={6} numberOfLines={1} ellipsizeMode="tail">
                {addressText}
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
            onPress={pressCallStoreHandler}
          >
            <PhoneFilledDotsIcon />
            <Text
              level={5}
              weight="bold"
              color={colors.blue}
              style={{ marginLeft: 15 }}
            >
              Contactar tienda
            </Text>
          </Touchable>
        </View>
        <Divider type="thick" style={{ marginTop: 20 }} />
        <View style={[globalStyles.withPadding, { marginTop: 30 }]}>
          <View style={{ flexDirection: 'row' }}>
            <Text
              level={4}
              weight="bold"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ flex: 1 }}
            >
              Productos
            </Text>
            <View style={{ width: 2 }} />
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
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      {content}
      <LoadingOverlay ref={loadingOverlayRef} />
      {state.contact && (
        <ActionSheetContact
          whatsapp_introduction="Hola!👋. Escribo desde *Shop Shop* para consultarle algo 😃"
          phone={order.transaction.store.phone}
          onRequestClose={contactCloseHandler}
        />
      )}
    </View>
  );
};
