import React, { ReactNode, useEffect, useReducer } from 'react';
import { View, ScrollView, GestureResponderEvent, Image } from 'react-native';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import axios, { CancelTokenSource } from 'axios';
import isAfter from 'date-fns/isAfter';
import sub from 'date-fns/sub';

// local components
import Skeletton from './components/skeletton';
import ProductItem from './components/product-item';
import CreatePaymentLinkModal from './components/create-payment-link-modal';
// components
import Text from '../../components/text';
import Divider from '../../components/divider';
import Touchable from '../../components/touchable';
import ErrorView from '../../components/error-view';
import Button from '../../components/buttons/button';
import BagHeadImage from '../../components/svgs/images/bag-head';
import ActionSheetContact from '../../components/modals/action-sheet-contact';
// cache
import storeCache from '../../cache/store';
import userCache from '../../cache/user';
import pendingSellerOrdersCache from '../../cache/pending-seller-orders-cache';
// clients
import orderClient from '../../clients/order-client';
import storeClient from '../../clients/store-client';
// libs
import * as utils from '../../lib/utils';
import dateFormatter from '../../lib/formatters/date-formatter';
import numberFormatter from '../../lib/formatters/number-formatter';
import { capture } from '../../lib/sentry';
// types
import { Order, Store } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[seller order details screen]';
let fetchOrderRequestSource: CancelTokenSource;
let fetchStoreRequestSource: CancelTokenSource;
type SetOrderAction = {
  type: 'set_order';
  order: Order;
};
type SetStoreAction = {
  type: 'set_store';
  store: Store;
};
type SetErrorAction = {
  type: 'set_error';
  error?: Error;
};
type SetContactModalAction = {
  type: 'set_contact_modal';
  contact_modal: boolean;
};
type SetAmountAction = {
  type: 'set_amount';
  amount: number;
};
type SetMapImageUrlAction = {
  type: 'set_map_image_url';
  map_image_url: string;
};
type SetPaymentLinkModalAction = {
  type: 'set_payment_link_modal';
  payment_link_modal: boolean;
};
type Action =
  | SetOrderAction
  | SetStoreAction
  | SetErrorAction
  | SetContactModalAction
  | SetAmountAction
  | SetMapImageUrlAction
  | SetPaymentLinkModalAction;
type State = {
  order?: Order;
  store?: Store;
  error?: Error;
  contact_modal: boolean;
  amount?: number;
  map_image_url?: string;
  payment_link_modal: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_order':
      return { ...state, order: action.order };
    case 'set_store':
      return { ...state, store: action.store };
    case 'set_error':
      return { ...state, error: action.error };
    case 'set_contact_modal':
      return { ...state, contact_modal: action.contact_modal };
    case 'set_amount':
      return { ...state, amount: action.amount };
    case 'set_map_image_url':
      return { ...state, map_image_url: action.map_image_url };
    case 'set_payment_link_modal':
      return { ...state, payment_link_modal: action.payment_link_modal };
    default:
      return state;
  }
};

interface ScreenProps {
  route: any;
}

export default ({ route }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    order:
      typeof route.params.order === 'string' ? undefined : route.params.order,
    store: storeCache.getData(),
    contact_modal: false,
    payment_link_modal: false,
  });

  // event handlers
  const fetchOrder = async (id: string) => {
    try {
      dispatch({ type: 'set_error', error: undefined });
      if (fetchOrderRequestSource) {
        fetchOrderRequestSource.cancel();
      }
      fetchOrderRequestSource = axios.CancelToken.source();
      const order = await orderClient.get(
        {
          pathVars: {
            id,
          },
        },
        { cancelToken: fetchOrderRequestSource.token }
      );
      dispatch({ type: 'set_order', order });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Fetch order error', error);

        dispatch({ type: 'set_error', error });
      }
    }
  };

  const fetchStore = async (id: string) => {
    try {
      dispatch({ type: 'set_error', error: undefined });
      if (fetchStoreRequestSource) {
        fetchStoreRequestSource.cancel();
      }
      fetchStoreRequestSource = axios.CancelToken.source();
      const store = await storeClient.get(
        {
          pathVars: {
            id,
          },
        },
        { cancelToken: fetchStoreRequestSource.token }
      );
      dispatch({ type: 'set_store', store });
      storeCache.setData(store);
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Fetch store error', error);

        dispatch({ type: 'set_error', error });
      }
    }
  };

  const pressContactStoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_contact_modal', contact_modal: true });
  };

  const contactModalCloseHandler = () => {
    dispatch({ type: 'set_contact_modal', contact_modal: false });
  };

  const pressImageMapHandler = () => {
    Linking.openURL(
      utils.createUrl(`${Constants.manifest.extra.GOOGLE_MAPS_URL}/search/`, {
        api: 1,
        query: `${state.order?.transaction.delivery_address.location.lat},${state.order?.transaction.delivery_address.location.lon}`,
        query_place_id: state.order?.transaction.delivery_address.id,
      })
    );
  };

  const retryHandler = () => {
    if (typeof route.params.order === 'string') {
      fetchOrder(route.params.order);
    }
  };

  const pressPaymentLinkHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_payment_link_modal', payment_link_modal: true });
  };

  const paymentLinkModalCloseHandler = () => {
    dispatch({ type: 'set_payment_link_modal', payment_link_modal: false });
  };

  useEffect(() => {
    if (typeof route.params.order === 'string') {
      fetchOrder(route.params.order);
    }
    return () => {
      fetchOrderRequestSource && fetchOrderRequestSource.cancel();
    };
  }, [route.params.order]);

  useEffect(() => {
    if (!state.store) {
      fetchStore(userCache.getData()?.current_store as string);
    }
    return () => {
      fetchStoreRequestSource && fetchStoreRequestSource.cancel();
    };
  }, [state.store]);

  useEffect(() => {
    if (state.order) {
      dispatch({
        type: 'set_amount',
        amount: state.order.transaction.shopping_cart.items.reduce(
          (amount, item) => amount + item.qty * item.price,
          0
        ),
      });
    }
  }, [state.order?.transaction.shopping_cart.items]);

  useEffect(() => {
    if (state.order) {
      dispatch({
        type: 'set_map_image_url',
        map_image_url: utils.createUrl(
          `${Constants.manifest.extra.GOOGLE_MAPS_API_URL}/staticmap`,
          {
            center: `${state.order.transaction.delivery_address.location.lat},${state.order.transaction.delivery_address.location.lon}`,
            zoom: 13,
            size: '140x105',
            scale: 2,
            format: 'png',
            markers: `icon:${Constants.manifest.extra.GOOGLE_MAPS_CUSTOM_MARKER}|scale:2|${state.order.transaction.delivery_address.location.lat},${state.order.transaction.delivery_address.location.lon}`,
            key: Constants.manifest.extra.GOOGLE_MAPS_API_KEY,
          }
        ),
      });
    }
  }, [
    state.order?.transaction.delivery_address.location.lat,
    state.order?.transaction.delivery_address.location.lon,
  ]);

  useEffect(() => {
    const id =
      typeof route.params.order === 'string'
        ? route.params.order
        : route.params.order.id;
    pendingSellerOrdersCache.markAsViewed(id);
  }, []);

  // render logic
  if (state.error) {
    return (
      <View
        style={{
          backgroundColor: colors.white,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ErrorView onRetry={retryHandler} />
      </View>
    );
  }

  if (!state.order || !state.store) {
    return <Skeletton />;
  }

  let addressText = `${state.order.transaction.delivery_address.route.short_name} ${state.order.transaction.delivery_address.street_number.short_name}`;
  let fullNameText = state.order.customer.first_name;
  const distance = utils.distance(
    state.store.delivery_area.center.location.lat,
    state.store.delivery_area.center.location.lon,
    state.order.transaction.delivery_address.location.lat,
    state.order.transaction.delivery_address.location.lon,
    'K'
  );
  let distanceText = `A ${numberFormatter.humanizeDistance(
    distance
  )} de distancia`;
  if (state.order.transaction.delivery_address.apartment) {
    addressText = `${addressText} · ${state.order.transaction.delivery_address.apartment}`;
  }
  if (state.order.customer.last_name) {
    fullNameText = `${fullNameText} ${state.order.customer.last_name}`;
  }
  if (distance === 0) {
    distanceText = 'En tu misma dirección';
  }
  let paymentButton: ReactNode = null;
  if (
    isAfter(new Date(state.order.created_at), sub(new Date(), { days: 3 })) &&
    state.store.payment_provider
  ) {
    paymentButton = (
      <Button
        type="link"
        title={
          <Text level={6} weight="bold" color={colors.blue}>
            Cobrar
          </Text>
        }
        style={{ paddingRight: 0 }}
        onPress={pressPaymentLinkHandler}
      />
    );
  }
  let photoComponent: ReactNode = <BagHeadImage />;
  if (state.order.customer.photo_url) {
    photoComponent = (
      <Image
        source={{
          uri: state.order.customer.photo_url,
        }}
        style={{
          width: 50,
          height: 50,
          borderRadius: 100,
        }}
      />
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={[{ flex: 1 }]}>
        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 20,
            },
            globalStyles.withMargin,
          ]}
        >
          {photoComponent}
          <View
            style={{
              marginLeft: 15,
              alignSelf: 'flex-start',
              paddingTop: 5,
              flex: 1,
            }}
          >
            <Text
              level={6}
              weight="bold"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ marginBottom: 5 }}
            >
              {fullNameText}
            </Text>
            <Text level={6} numberOfLines={1} ellipsizeMode="tail">
              {dateFormatter.format(
                new Date(state.order.created_at),
                "dd MMMM, yyyy · HH:mm 'hrs'"
              )}
            </Text>
          </View>
        </View>

        <Divider type="thick" />

        <View
          style={[
            { flexDirection: 'row', marginVertical: 20 },
            globalStyles.withMargin,
          ]}
        >
          {!!state.map_image_url && (
            <Touchable onPress={pressImageMapHandler}>
              <Image
                source={{
                  uri: state.map_image_url,
                }}
                style={{
                  width: 140,
                  height: 105,
                  borderRadius: 13,
                }}
              />
            </Touchable>
          )}
          <View style={{ marginLeft: 15, marginTop: 5, flex: 1 }}>
            <Text
              level={6}
              weight="bold"
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{ lineHeight: 20, marginBottom: 7 }}
            >
              {addressText}
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

        <Divider type="thick" />

        <View style={[{ marginVertical: 20 }, globalStyles.withMargin]}>
          <View
            style={{
              marginBottom: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text level={5} weight="bold">
              Productos
            </Text>
            {paymentButton}
          </View>

          <Divider type="thin" style={{ marginBottom: 15 }} />
          {state.order.transaction.shopping_cart.items.map(
            (item, index, array) => (
              <ProductItem
                key={`${item.id}`}
                data={item}
                last={index === array.length - 1}
              />
            )
          )}
          <Divider type="thin" style={{ marginTop: 15 }} />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 20,
            }}
          >
            <Text level={5} weight="bold">
              Total
            </Text>
            {!!state.amount && (
              <Text level={6} weight="bold">
                {numberFormatter.toCurrency(state.amount)}
              </Text>
            )}
          </View>
        </View>

        <View style={globalStyles.withScreenAir} />
      </ScrollView>
      <View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.white,
            paddingTop: 2,
          },
          globalStyles.withMargin,
        ]}
      >
        <Button
          title="Contactar cliente"
          style={globalStyles.withMainActionAir}
          onPress={pressContactStoreHandler}
        />
      </View>
      {state.contact_modal && (
        <ActionSheetContact
          phone={state.order.customer.phone}
          onRequestClose={contactModalCloseHandler}
        />
      )}
      {state.payment_link_modal && (
        <CreatePaymentLinkModal
          order={state.order}
          store={state.store as Store}
          onClose={paymentLinkModalCloseHandler}
        />
      )}
    </View>
  );
};
