import React from 'react';
import {
  View,
  GestureResponderEvent,
  ViewStyle,
  StyleProp,
} from 'react-native';

// components
import Touchable from '../../../../../components/touchable';
import Text from '../../../../../components/text';
import Icon from '../../../../../components/icon';
// containers
import UserProvider from '../../../../../containers/user';
// libs
import numberFormatter from '../../../../../lib/formatters/number-formatter';
import dateFormatter from '../../../../../lib/formatters/date-formatter';
import * as utils from '../../../../../lib/utils';
// types
import { Order, OwnerDispatchStatus } from '../../../../../types';
// styles
import colors from '../../../../../styles/colors';

const prefix = '[order item component]';

export interface OrderItemProps {
  order: Order;
  onPress?: (order: Order) => void;
  style?: StyleProp<ViewStyle>;
}

export default ({ order, onPress = () => null, style }: OrderItemProps) => {
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const stats = utils.getStats(order.transaction.shopping_cart);

  // event handlers
  const pressHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress(order);
  };

  // render logic
  let fullName = order.customer.first_name;
  if (order.customer.last_name) {
    fullName = `${fullName} ${order.customer.last_name}`;
  }
  let totalLabel = 'producto';
  if (stats.total > 1) {
    totalLabel = `${totalLabel}s`;
  }

  let distanceText = '';
  if (order.provider.status !== OwnerDispatchStatus.DELIVERED) {
    const distance = utils.distance(
      order.transaction.store.delivery_area?.center.geometry.location.lat,
      order.transaction.store.delivery_area.center.geometry.location.lng,
      order.transaction.delivery_address.geometry.location.lat,
      order.transaction.delivery_address.geometry.location.lng,
      'K'
    );
    distanceText = ` · A ${numberFormatter.humanizeDistance(
      distance
    )} de distancia`;
    if (distance === 0) {
      distanceText = ' · En tu misma dirección';
    }
  }

  return (
    <Touchable
      onPress={pressHandler}
      style={[
        {
          borderWidth: 1,
          borderColor: colors.blackLight6,
          borderRadius: 13,
          flexDirection: 'row',
          paddingVertical: 20,
          paddingHorizontal: 15,
        },
        style,
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          level={5}
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginBottom: 5 }}
        >
          {fullName}
        </Text>
        <Text
          level={6}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginBottom: 5 }}
        >
          <Text level={6} weight="bold">
            {stats.total}
          </Text>
          {` ${totalLabel}${distanceText}`}
        </Text>
        <Text level={7} color={colors.blackLight3}>
          {dateFormatter.format(
            new Date(order.created_at),
            "dd MMMM, yyyy · HH:mm 'hrs'"
          )}
        </Text>
      </View>
      <Text level={5} weight="bold" style={{ marginHorizontal: 10 }}>
        {numberFormatter.toCurrency(stats.ammount)}
      </Text>
      <Icon name="chevron-right" style={{ alignSelf: 'center' }} />
    </Touchable>
  );
};
