import React from 'react';
import {
  View,
  GestureResponderEvent,
  ViewStyle,
  StyleProp,
} from 'react-native';

// components
import { Touchable, Text, Icon } from '../../../../../../../components';
// libs
import numberFormatter from '../../../../../../../lib/formatters/number-formatter';
import dateFormatter from '../../../../../../../lib/formatters/date-formatter';
// types
import { Order } from '../../../../../../../types';
// styles
import colors from '../../../../../../../styles/colors';

export interface SellItemProps {
  sell: Order;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default ({ sell, onPress = () => null, style }: SellItemProps) => {
  // event handlers
  const pressHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress();
  };

  // render logic
  let fullName = sell.customer.firstName;
  if (sell.customer.lastName) {
    fullName = `${fullName} ${sell.customer.lastName}`;
  }
  let totalLabel = 'producto';
  if (sell.transaction.stats.total > 1) {
    totalLabel = `${totalLabel}s`;
  }
  let paymentMethod = 'Pago a convenir';
  if (sell.transaction.paymentMethod === 'CREDIT_CARD') {
    paymentMethod = 'Pago con tarjeta';
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
            {sell.transaction.stats.total}
          </Text>
          {` ${totalLabel} · ${paymentMethod}`}
        </Text>
        <Text level={7} color={colors.blackLight3}>
          {dateFormatter.format(
            new Date(sell.createdAt),
            "dd MMMM, yyyy · HH:mm 'hrs'"
          )}
        </Text>
      </View>
      <Text level={5} weight="bold" style={{ marginHorizontal: 10 }}>
        {numberFormatter.toCurrency(sell.transaction.stats.ammount)}
      </Text>
      <Icon name="chevron-right" />
    </Touchable>
  );
};
