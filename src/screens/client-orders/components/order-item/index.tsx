import React, { memo, ReactNode, useEffect, useState } from 'react';
import { GestureResponderEvent, View } from 'react-native';

// components
import Touchable from '../../../../components/touchable';
import Text from '../../../../components/text';
import Icon from '../../../../components/icon';
// libs
import numberFormatter from '../../../../lib/formatters/number-formatter';
import dateFormatter from '../../../../lib/formatters/date-formatter';
// types
import { Order, OrderStatus } from '../../../../types';
// styles
import colors from '../../../../styles/colors';

interface ComponentProps {
  data: Order;
  navigation: any;
}

export default memo(({ data, navigation }: ComponentProps) => {
  const [stats, setStats] = useState<{ amount: number } | undefined>();
  // event handlers
  const pressHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('ClientOrderDetails', { order: data });
  };

  useEffect(() => {
    setStats(
      data.transaction.shopping_cart.items.reduce(
        (stats, item) => {
          const result = { ...stats };
          result.amount += item.qty * item.price;
          return result;
        },
        { amount: 0 }
      )
    );
  }, [data]);

  // render logic
  let amountText = '';
  let statusComponent: ReactNode = null;
  if (stats) {
    amountText = numberFormatter.toCurrency(stats.amount);
  }
  if (data.status) {
    let color = colors.yellow;
    let text = 'Creado';
    if (data.status === OrderStatus.CONFIRMED) {
      text = 'Confirmado';
    } else if (data.status === OrderStatus.DELIVERED) {
      color = colors.green;
      text = 'Entregado';
    } else if (data.status === OrderStatus.CANCELLED) {
      color = colors.red;
      text = 'Cancelado';
    }
    statusComponent = (
      <View
        style={{
          marginHorizontal: 10,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            borderRadius: 50,
            backgroundColor: color,
            width: 10,
            height: 10,
          }}
        />
        <Text level={7} style={{ marginLeft: 5 }}>
          {text}
        </Text>
      </View>
    );
  }
  return (
    <Touchable
      style={{
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.blackLight6,
        borderRadius: 13,
        paddingVertical: 10,
        paddingHorizontal: 10,
      }}
      onPress={pressHandler}
    >
      <View style={{ flex: 1 }}>
        <Text level={7} color={colors.blackLight3} style={{ marginBottom: 5 }}>
          {dateFormatter.format(
            new Date(data.created_at),
            'd MMM, yyyy · HH:mm'
          )}
        </Text>
        <Text
          level={6}
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginBottom: 1 }}
        >
          {data.transaction.shopping_cart.store.name}
        </Text>
        <Text level={7} numberOfLines={1} ellipsizeMode="tail">
          {amountText}
        </Text>
      </View>
      {statusComponent}
      <Icon name="chevron-right" style={{ alignSelf: 'center' }} />
    </Touchable>
  );
});
