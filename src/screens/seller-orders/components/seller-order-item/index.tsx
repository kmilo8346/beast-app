import React, { memo, useEffect, useState } from 'react';
import { GestureResponderEvent, View } from 'react-native';

// components
import Touchable from '../../../../components/touchable';
import Text from '../../../../components/text';
import Icon from '../../../../components/icon';
// cache
import usePendingSellerOrdersCache from '../../../../cache/use-pending-seller-orders-cache';
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
  const [isViewed, setIsViewed] = useState<boolean | undefined>();
  const pendingSellerOrdersCache = usePendingSellerOrdersCache();
  // event handlers
  const pressHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('SellerOrderDetails', { order: data });
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

  useEffect(() => {
    if (!pendingSellerOrdersCache) {
      return;
    }
    const unsubscribe = pendingSellerOrdersCache.onChange(() => {
      setIsViewed(pendingSellerOrdersCache.isViewed(data));
    });
    return () => {
      unsubscribe();
    };
  }, [pendingSellerOrdersCache]);

  // render logic
  let totalText = '';
  let amountText = '';
  let fullNameText = data.customer.first_name;
  if (stats) {
    totalText = `${stats.total} product${stats.total > 1 ? 's' : ''}`;
    amountText = numberFormatter.toCurrency(stats.amount);
  }
  if (data.customer.last_name) {
    fullNameText = `${fullNameText} ${data.customer.last_name}`;
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
          {fullNameText}
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
      <View style={{ marginHorizontal: 10 }}>
        <Text level={5} weight="bold">
          {amountText}
        </Text>
        {typeof isViewed !== 'undefined' && !isViewed && (
          <Text level={5} weight="bold" color={colors.red}>
            nuevo
          </Text>
        )}
      </View>
      <Icon name="chevron-right" style={{ alignSelf: 'center' }} />
    </Touchable>
  );
});
