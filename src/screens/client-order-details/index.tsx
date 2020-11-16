import React, { ReactNode, useEffect, useReducer } from 'react';
import { View, ScrollView, GestureResponderEvent, Image } from 'react-native';

// local components
import ProductItem from './components/product-item';
// components
import Icon from '../../components/icon';
import Text from '../../components/text';
import Divider from '../../components/divider';
import Touchable from '../../components/touchable';
import Button from '../../components/buttons/button';
import BagHeadImage from '../../components/svgs/images/bag-head';
import ActionSheetContact from '../../components/modals/action-sheet-contact';
import MapPinShadedBlueIcon from '../../components/svgs/icons/map-pin-shaded-blue';
// libs
import cloudinary from '../../lib/cloudinary';
import dateFormatter from '../../lib/formatters/date-formatter';
import numberFormatter from '../../lib/formatters/number-formatter';
import * as utils from '../../lib/utils';
// types
import { Order } from '../../types';
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
type Action = SetContactModalAction | SetAmountAction;
type State = {
  contact_modal: boolean;
  amount?: number;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_contact_modal':
      return { ...state, contact_modal: action.contact_modal };
    case 'set_amount':
      return { ...state, amount: action.amount };
    default:
      return state;
  }
};

interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    contact_modal: false,
  });
  const order = route.params.order as Order;

  // event handlers
  const pressContactStoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_contact_modal', contact_modal: true });
  };

  const contactModalCloseHandler = () => {
    dispatch({ type: 'set_contact_modal', contact_modal: false });
  };

  const pressStoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('Store', {
      store: order.transaction.shopping_cart.store,
    });
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

  // render logic
  let addressText = utils.formatPlace(order.transaction.delivery_address);
  if (order.transaction.delivery_address.apartment) {
    addressText = `${addressText} · ${order.transaction.delivery_address.apartment}`;
  }
  let photoComponent: ReactNode = <BagHeadImage />;
  if (order.customer.photo_url) {
    photoComponent = (
      <Image
        source={{
          uri: cloudinary.dynamicUrl(
            order.transaction.shopping_cart.store.images[0],
            'w_500'
          ),
        }}
        style={{
          width: 50,
          height: 50,
          borderRadius: 10,
        }}
      />
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={[{ flex: 1 }]}>
        <Touchable
          style={[
            { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
            globalStyles.withMargin,
          ]}
          onPress={pressStoreHandler}
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
              {order.transaction.shopping_cart.store.name}
            </Text>
            <Text level={6} numberOfLines={1} ellipsizeMode="tail">
              {dateFormatter.format(
                new Date(order.created_at),
                "dd MMMM, yyyy · HH:mm 'hrs'"
              )}
            </Text>
          </View>
          <Icon name="chevron-right" />
        </Touchable>

        <Divider type="thick" />

        <View
          style={[
            { flexDirection: 'row', marginVertical: 20 },
            globalStyles.withMargin,
          ]}
        >
          <View style={{ width: 50, alignItems: 'center' }}>
            <MapPinShadedBlueIcon />
          </View>
          <View style={{ marginLeft: 15, flex: 1 }}>
            <Text level={6} weight="bold" style={{ marginBottom: 2 }}>
              Dirección de entrega
            </Text>
            <Text level={6} style={{ lineHeight: 20 }}>
              {addressText}
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
          title="Contactar tienda"
          style={globalStyles.withMainActionAir}
          onPress={pressContactStoreHandler}
        />
      </View>
      {state.contact_modal && (
        <ActionSheetContact
          phone={order.transaction.shopping_cart.store.phone}
          onRequestClose={contactModalCloseHandler}
        />
      )}
    </View>
  );
};
