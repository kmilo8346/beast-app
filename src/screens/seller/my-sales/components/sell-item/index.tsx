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

const prefix = '[sell item component]';

export interface SellItemProps {
  sell: Order;
  onPress?: (order: Order) => void;
  style?: StyleProp<ViewStyle>;
}

export default ({ sell, onPress = () => null, style }: SellItemProps) => {
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const store = user.store;
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }
  if (!store.deliveryArea) {
    throw new Error(`${prefix} Store must have a delivery area`);
  }
  const stats = utils.getStats(sell.transaction.shopping_cart);

  // event handlers
  const pressHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress(sell);
  };

  // render logic
  let fullName = sell.customer.first_name;
  if (sell.customer.last_name) {
    fullName = `${fullName} ${sell.customer.last_name}`;
  }
  let totalLabel = 'producto';
  if (stats.total > 1) {
    totalLabel = `${totalLabel}s`;
  }

  let distanceText = '';
  if (sell.provider.status !== OwnerDispatchStatus.DELIVERED) {
    const distance = utils.distance(
      store.deliveryArea?.center.geometry.location.lat,
      store.deliveryArea.center.geometry.location.lng,
      sell.transaction.delivery_address.geometry.location.lat,
      sell.transaction.delivery_address.geometry.location.lng,
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
            new Date(sell.created_at),
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
