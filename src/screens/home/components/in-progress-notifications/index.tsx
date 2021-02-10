import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import {
  View,
  GestureResponderEvent,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// components
import Icon from '../../../../components/icon';
import Text from '../../../../components/text';
import Image from '../../../../components/image';
import Touchable from '../../../../components/touchable';
import BagHeadImage from '../../../../components/svgs/images/bag-head';
// cache
import userCache from '../../../../cache/user';
import ordersInProgressCache, {
  OrderType,
  toTyped,
  TypedOrder,
} from '../../../../cache/orders-in-progress-cache';
// libs
import cloudinary from '../../../../lib/cloudinary';
import dateFormatter from '../../../../lib/formatters/date-formatter';
// types
import { OrderStatus } from '../../../../types';
// styles
import colors from '../../../../styles/colors';

interface ComponentProps {
  navigation: any;
}

export default ({ navigation }: ComponentProps) => {
  // state
  const [orders, setOrders] = useState<TypedOrder[]>([]);
  const [expanded, setExpanded] = useState(false);

  // event handlers
  const pressNotification = (order: TypedOrder) => {
    if (order.type === OrderType.CLIENT) {
      navigation.navigate('ClientOrderDetails', { order: order.data });
    } else if (order.type === OrderType.SELLER) {
      navigation.navigate('SellerOrderDetails', { order: order.data });
    }
  };

  const pressGroupHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setExpanded(true);
  };

  const pressShowLessHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setExpanded(false);
  };

  useEffect(() => {
    const unsubscribe = ordersInProgressCache.onChange((data) => {
      setOrders(toTyped(data?.orders, userCache.getData()?.id));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setExpanded(false);
      };
    }, [])
  );

  // render logic
  const renderOrder = (order: TypedOrder, touchable = true) => {
    let image: string | undefined;
    let text = '';
    const date = dateFormatter.format(
      new Date(order.data.updated_at),
      "eee, d MMM · HH:mm 'hrs'"
    );
    let imageComponent = <BagHeadImage width={33} height={39} />;
    let content: ReactNode = null;

    if (
      order.type === OrderType.CLIENT &&
      order.data.status === OrderStatus.CREATED
    ) {
      image = order.data.transaction.shopping_cart.store.images[0];
      text = `${order.data.transaction.shopping_cart.store.name} aún no confirma el pedido`;
    } else if (
      order.type === OrderType.CLIENT &&
      order.data.status === OrderStatus.CONFIRMED
    ) {
      image = order.data.transaction.shopping_cart.store.images[0];
      text = `${order.data.transaction.shopping_cart.store.name} va en camino con tu pedido`;
    } else if (
      order.type === OrderType.SELLER &&
      order.data.status === OrderStatus.CREATED
    ) {
      image = order.data.customer.photo_url;
      text = `Confirma la orden de ${order.data.customer.first_name}`;
    } else if (
      order.type === OrderType.SELLER &&
      order.data.status === OrderStatus.CONFIRMED
    ) {
      image = order.data.customer.photo_url;
      text = `Entrega la orden de ${order.data.customer.first_name}`;
    }

    if (image) {
      imageComponent = (
        <Image
          source={{
            uri: cloudinary.dynamicUrl(image, 'w_500'),
          }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
          }}
        />
      );
    }
    content = (
      <View
        style={{
          backgroundColor: colors.blue,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
          minHeight: 55,
        }}
      >
        {imageComponent}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            level={7}
            color={colors.white}
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ marginBottom: 3 }}
          >
            {text}
          </Text>
          <Text
            level={7}
            color={colors.white}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {date}
          </Text>
        </View>
        {touchable && <Icon name="chevron-right" color={colors.white} />}
      </View>
    );

    if (!touchable) {
      return content;
    }

    return (
      <Touchable
        onPress={(event: GestureResponderEvent) => {
          event.stopPropagation();
          pressNotification(order);
        }}
      >
        {content}
      </Touchable>
    );
  };

  if (orders.length === 0) {
    return null;
  }

  if (orders.length === 1) {
    return (
      <View style={{ marginBottom: 10, marginHorizontal: 10 }}>
        {renderOrder(orders[0])}
      </View>
    );
  }

  if (!expanded) {
    return (
      <Touchable
        style={{ marginBottom: 10, marginHorizontal: 10 }}
        onPress={pressGroupHandler}
      >
        {renderOrder(orders[0], false)}
        <View
          style={{
            alignSelf: 'center',
            width: '90%',
            height: 5,
            backgroundColor: colors.blue,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,

            elevation: 5,
          }}
        />
        {orders.length > 2 && (
          <View
            style={{
              alignSelf: 'center',
              width: '85%',
              height: 5,
              backgroundColor: colors.blue,
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,

              elevation: 5,
            }}
          />
        )}
      </Touchable>
    );
  }

  return (
    <View style={{ marginHorizontal: 10 }}>
      <Touchable
        style={{
          alignSelf: 'flex-end',
          backgroundColor: colors.blue,
          borderRadius: 8,
          paddingLeft: 5,
          paddingRight: 8,
          paddingVertical: 5,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={pressShowLessHandler}
      >
        <Icon name="chevron-up" color={colors.white} size={20} />
        <Text
          level={7}
          color={colors.white}
          style={{ opacity: 1, marginLeft: 3 }}
        >
          Mostrar Menos
        </Text>
      </Touchable>
      <ScrollView
        style={{
          maxHeight: Dimensions.get('window').height / 2.5,
          paddingTop: 10,
        }}
      >
        {orders.map((order) => (
          <View key={order.id} style={{ marginBottom: 10 }}>
            {renderOrder(order)}
          </View>
        ))}
        <View style={{ marginBottom: 20 }} />
      </ScrollView>
    </View>
  );
};
