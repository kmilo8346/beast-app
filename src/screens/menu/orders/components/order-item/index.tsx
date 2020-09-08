import React, { ReactNode } from 'react';
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
// cache
import userCache from '../../../../../cache/user';
// libs
import numberFormatter from '../../../../../lib/formatters/number-formatter';
import dateFormatter from '../../../../../lib/formatters/date-formatter';
import durationFormatter from '../../../../../lib/formatters/duration-formatter';
import * as utils from '../../../../../lib/utils';
// types
import {
  Order,
  OwnerDispatchStatus,
  OrderStatus,
  LoggedUser,
} from '../../../../../types';
// styles
import colors from '../../../../../styles/colors';

const prefix = '[order item component]';

export interface OrderItemProps {
  order: Order;
  onPress?: (order: Order) => void;
  style?: StyleProp<ViewStyle>;
}

export default ({ order, onPress = () => null, style }: OrderItemProps) => {
  const user = userCache.getData() as LoggedUser;
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
  let totalLabel = 'producto';
  if (stats.total > 1) {
    totalLabel = `${totalLabel}s`;
  }

  let distanceText = '';
  if (
    order.dispatch_provider.status !== OwnerDispatchStatus.DELIVERED &&
    order.status !== OrderStatus.CANCELLED
  ) {
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
  // cancelled status
  let cancelledStatusIndicator: ReactNode;
  if (order.status === OrderStatus.CANCELLED) {
    cancelledStatusIndicator = (
      <View
        style={{
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 5,
          backgroundColor: colors.redLight3,
          alignSelf: 'flex-start',
          marginRight: 10,
        }}
      >
        <Text level={6} color={colors.redLight2} weight="bold">
          Cancelado
        </Text>
      </View>
    );
  }
  // estimated delivery time component
  let estimatedDeliveryTimeComponent: ReactNode | null = null;
  if (order.dispatch_provider.status === OwnerDispatchStatus.CONFIRMED) {
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
  return (
    <Touchable
      onPress={pressHandler}
      style={[
        {
          borderWidth: 1,
          borderColor: colors.blackLight6,
          borderRadius: 13,
          paddingVertical: 20,
          paddingHorizontal: 15,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row' }}>
            {cancelledStatusIndicator}
            <Text
              level={5}
              weight="bold"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ marginBottom: 5 }}
            >
              {order.transaction.store.name}
            </Text>
          </View>
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
      </View>
      {estimatedDeliveryTimeComponent}
    </Touchable>
  );
};
