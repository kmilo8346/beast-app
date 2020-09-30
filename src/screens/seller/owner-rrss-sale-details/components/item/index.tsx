import React from 'react';
import { View } from 'react-native';

// components
import Text from '../../../../../components/text';
// libs
import numberFormatter from '../../../../../lib/formatters/number-formatter';
// types
import { Item } from '../../../../../types';

export interface ItemProps {
  product: Item;
}

export default ({ product }: ItemProps) => {
  // render logic
  return (
    <View
      key={product.id}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
      }}
    >
      <View
        style={{
          borderWidth: 2,
          borderRadius: 4,
          paddingVertical: 3,
          paddingHorizontal: 5,
          minWidth: 25,
          minHeight: 25,
          alignItems: 'center',
        }}
      >
        <Text level={6}>{product.qty}</Text>
      </View>

      <Text
        level={6}
        numberOfLines={2}
        ellipsizeMode="tail"
        style={{ flex: 1, marginLeft: 10, alignSelf: 'center' }}
      >
        {product.name}
      </Text>

      <Text level={6} style={{ marginLeft: 10 }}>
        {numberFormatter.toCurrency(product.qty * product.price)}
      </Text>
    </View>
  );
};
