import React, { memo } from 'react';
import { View } from 'react-native';

// components
import Text from '../../../../components/text';
// libs
import numberFormatter from '../../../../lib/formatters/number-formatter';
// types
import { Item } from '../../../../types';
// styles
import colors from '../../../../styles/colors';

interface ComponetProps {
  data: Item;
  last: boolean;
}

export default memo(({ data, last }: ComponetProps) => {
  // render logic
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: last ? 0 : 15,
      }}
    >
      <View
        style={{
          borderWidth: 2,
          borderColor: colors.blackLight9,
          borderRadius: 4,
          justifyContent: 'center',
          alignItems: 'center',
          minWidth: 30,
          minHeight: 38,
        }}
      >
        <Text level={6} weight="bold">
          {data.qty}
        </Text>
      </View>
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text
          level={6}
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginBottom: 2 }}
        >
          {data.name}
        </Text>
        {!!data.description && (
          <Text level={7} numberOfLines={1} ellipsizeMode="tail">
            {data.description}
          </Text>
        )}
      </View>
      <Text level={6} weight="bold" style={{ marginLeft: 5 }}>
        {numberFormatter.toCurrency(data.price)}
      </Text>
    </View>
  );
});
