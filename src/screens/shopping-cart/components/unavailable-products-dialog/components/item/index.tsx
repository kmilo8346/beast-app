import React from 'react';
import { View, Image } from 'react-native';

// components
import Text from '../../../../../../components/text';
// libs
import numberFormatter from '../../../../../../lib/formatters/number-formatter';
import cloudinary from '../../../../../../lib/cloudinary';
// types
import { Product } from '../../../../../../types';

interface ComponentProps {
  data: Product;
}

export default ({ data }: ComponentProps) => {
  // render logic
  return (
    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
      <Image
        source={{ uri: cloudinary.dynamicUrl(data.images[0], 'w_100') }}
        style={{ width: 50, height: 50, borderRadius: 10 }}
      />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text level={6} weight="bold" numberOfLines={1} ellipsizeMode="tail">
          {data.name}
        </Text>
        <Text
          level={7}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginBottom: 2 }}
        >
          {data.description}
        </Text>
        <Text level={6} weight="bold">
          {numberFormatter.toCurrency(data.price)}
        </Text>
      </View>
    </View>
  );
};
