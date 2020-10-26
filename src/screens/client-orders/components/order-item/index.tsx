import React, { memo, useEffect, useState } from 'react';
import { GestureResponderEvent, View } from 'react-native';

// components
import Touchable from '../../../../components/touchable';
import Text from '../../../../components/text';
import Icon from '../../../../components/icon';
// libs
import numberFormatter from '../../../../lib/formatters/number-formatter';
import dateFormatter from '../../../../lib/formatters/date-formatter';
// types
import { Order } from '../../../../types';
// styles
import colors from '../../../../styles/colors';

interface ComponentProps {
  data: Order;
  navigation: any;
}

export default memo(({ data, navigation }: ComponentProps) => {
  const [stats, setStats] = useState<
    { total: number; amount: number } | undefined
  >();
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
          result.total += item.qty;
          result.amount += item.qty * item.price;
          return result;
        },
        { total: 0, amount: 0 }
      )
    );
  }, [data]);

  // render logic
  let totalText = '';
  let amountText = '';
  if (stats) {
    totalText = `${stats.total} product${stats.total > 1 ? 's' : ''}`;
    amountText = numberFormatter.toCurrency(stats.amount);
  }
  return (
    <Touchable
      style={{
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.blackLight6,
        borderRadius: 13,
        paddingVertical: 10,
        paddingHorizontal: 15,
      }}
      onPress={pressHandler}
    >
      <View style={{ flex: 1 }}>
        <Text
          level={5}
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginBottom: 5 }}
        >
          {data.transaction.shopping_cart.store.name}
        </Text>
        <Text
          level={6}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginBottom: 5 }}
        >
          {totalText}
        </Text>
        <Text level={7} color={colors.blackLight3}>
          {dateFormatter.format(
            new Date(data.created_at),
            "dd MMMM, yyyy · HH:mm 'hrs'"
          )}
        </Text>
      </View>
      <Text level={5} weight="bold" style={{ marginHorizontal: 10 }}>
        {amountText}
      </Text>
      <Icon name="chevron-right" style={{ alignSelf: 'center' }} />
    </Touchable>
  );
});
