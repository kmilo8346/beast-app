import React from 'react';
import { View } from 'react-native';

// components
import Text from '../../../../../../components/text';
// types
import { Item } from '../../../../../../types';
// styles
import colors from '../../../../../../styles/colors';
import numberFormatter from '../../../../../../lib/formatters/number-formatter';

interface ComponentProps {
  data: Item;
}

export default ({ data }: ComponentProps) => {
  // render logic
  return (
    <View style={{ flexDirection: 'row', marginBottom: 30 }}>
      <View
        style={{
          borderWidth: 2,
          borderColor: colors.blackLight9,
          borderRadius: 4,
          justifyContent: 'center',
          alignItems: 'center',
          minWidth: 30,
        }}
      >
        <Text level={6} weight="bold">
          {data.qty}
        </Text>
      </View>

      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text
          level={6}
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginBottom: 2 }}
        >
          {data.name}
        </Text>
        <Text level={7} numberOfLines={1} ellipsizeMode="tail">
          {data.description}
        </Text>
      </View>

      <Text level={6} weight="bold" style={{ paddingTop: 5, marginLeft: 15 }}>
        {numberFormatter.toCurrency(data.price)}
      </Text>
    </View>
  );
};
