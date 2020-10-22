import React, { useEffect, useReducer } from 'react';
import { View, ScrollView, GestureResponderEvent, Image } from 'react-native';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

// local components
import ProductItem from './components/product-item';
// components
import Text from '../../components/text';
import Divider from '../../components/divider';
import Touchable from '../../components/touchable';
import Button from '../../components/buttons/button';
import ActionSheetContact from '../../components/modals/action-sheet-contact';
// cache
import storeCache from '../../cache/store';
// libs
import * as utils from '../../lib/utils';
import dateFormatter from '../../lib/formatters/date-formatter';
import numberFormatter from '../../lib/formatters/number-formatter';
// types
import { Order, Store } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
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
type Action = SetContactModalAction | SetAmountAction | SetMapImageUrlAction;
type State = {
  contact_modal: boolean;
  amount?: number;
  map_image_url?: string;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_contact_modal':
      return { ...state, contact_modal: action.contact_modal };
    case 'set_amount':
      return { ...state, amount: action.amount };
    case 'set_map_image_url':
      return { ...state, map_image_url: action.map_image_url };
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
    contact_modal: false,
  });
  const order = route.params.order as Order;
  const store = storeCache.getData() as Store;

  // event handlers
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
        query: `${order.transaction.delivery_address.geometry.location.lat},${order.transaction.delivery_address.geometry.location.lng}`,
        query_place_id: order.transaction.delivery_address.id,
      })
    );
  };

  useEffect(() => {
    dispatch({
      type: 'set_amount',
      amount: order.transaction.shopping_cart.items.reduce(
        (amount, item) => amount + item.qty * item.price,
        0
      ),
    });
  }, [order.transaction.shopping_cart.items]);

  useEffect(() => {
    dispatch({
      type: 'set_map_image_url',
      map_image_url: utils.createUrl(
        `${Constants.manifest.extra.GOOGLE_MAPS_API_URL}/staticmap`,
        {
          center: `${order.transaction.delivery_address.geometry.location.lat},${order.transaction.delivery_address.geometry.location.lng}`,
          zoom: 13,
          size: '140x105',
          scale: 2,
          format: 'png',
          markers: `icon:${Constants.manifest.extra.GOOGLE_MAPS_CUSTOM_MARKER}|scale:2|${order.transaction.delivery_address.geometry.location.lat},${order.transaction.delivery_address.geometry.location.lng}`,
          key: Constants.manifest.extra.GOOGLE_MAPS_API_KEY,
        }
      ),
    });
  }, [
    order.transaction.delivery_address.geometry.location.lat,
    order.transaction.delivery_address.geometry.location.lng,
  ]);

  // render logic
  let addressText = `${order.transaction.delivery_address.route.short_name} ${order.transaction.delivery_address.street_number.short_name}`;
  let fullNameText = order.customer.first_name;
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
  if (order.transaction.delivery_address.apartment) {
    addressText = `${addressText} · ${order.transaction.delivery_address.apartment}`;
  }
  if (order.customer.last_name) {
    fullNameText = `${fullNameText} ${order.customer.last_name}`;
  }
  if (distance === 0) {
    distanceText = 'En tu misma dirección';
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={[{ flex: 1 }]}>
        <View
          style={[
            { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
            globalStyles.withMargin,
          ]}
        >
          <Image
            source={{
              uri: order.customer.photo_url,
            }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 100,
            }}
          />
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
                new Date(order.created_at),
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
          <Text
            level={5}
            weight="bold"
            style={{
              marginBottom: 20,
            }}
          >
            Productos
          </Text>

          <Divider type="thin" style={{ marginBottom: 15 }} />
          {order.transaction.shopping_cart.items.map((item, index, array) => (
            <ProductItem
              key={`${item.id}`}
              data={item}
              last={index === array.length - 1}
            />
          ))}
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
          phone={order.customer.phone}
          onRequestClose={contactModalCloseHandler}
        />
      )}
    </View>
  );
};
