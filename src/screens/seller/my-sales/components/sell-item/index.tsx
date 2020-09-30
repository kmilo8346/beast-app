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
import storeCache from '../../../../../cache/store';
// libs
import numberFormatter from '../../../../../lib/formatters/number-formatter';
import durationFormatter from '../../../../../lib/formatters/duration-formatter';
import dateFormatter from '../../../../../lib/formatters/date-formatter';
import * as utils from '../../../../../lib/utils';
// types
import {
  DispatchProvider,
  Order,
  OwnerDispatchStatus,
} from '../../../../../types';
// styles
import colors from '../../../../../styles/colors';

const prefix = '[sell item component]';

export interface SellItemProps {
  sell: Order;
  onPress?: (order: Order) => void;
  style?: StyleProp<ViewStyle>;
}

export default ({ sell, onPress = () => null, style }: SellItemProps) => {
  const store = storeCache.getData();
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }
  if (!store.delivery_area) {
    throw new Error(`${prefix} Store must have a delivery area`);
  }
  const stats = utils.getStats(sell.transaction.shopping_cart);

  // event handlers
  const pressHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress(sell);
  };

  // render logic

  let fullName = 'Usuario x red social';
  if (sell.dispatch_provider_id === DispatchProvider.OWNER) {
    fullName = sell.customer.first_name;
    if (sell.customer.last_name) {
      fullName = `${fullName} ${sell.customer.last_name}`;
    }
  }

  let totalLabel = 'producto';
  if (stats.total > 1) {
    totalLabel = `${totalLabel}s`;
  }

  let distanceText = '';
  if (
    sell.dispatch_provider_id === DispatchProvider.OWNER &&
    sell.dispatch_provider.status !== OwnerDispatchStatus.DELIVERED
  ) {
    const distance = utils.distance(
      store.delivery_area?.center.geometry.location.lat,
      store.delivery_area.center.geometry.location.lng,
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

  // estimated delivery time component
  let estimatedDeliveryTimeComponent: ReactNode | null = null;
  if (sell.dispatch_provider.status === OwnerDispatchStatus.CONFIRMED) {
    // estimated delivery time
    const durationToDeliver = durationFormatter.humanizeDurationToFinish(
      sell.updated_at,
      sell.transaction.store.delivery_time.lte,
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
          Entregar en
          {durationToDeliver !== 'menos de 5 minutos' ? ' menos de' : ''}{' '}
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
      </View>
      {estimatedDeliveryTimeComponent}
    </Touchable>
  );
};
