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
  const hasDescription = !!data.description;
  return (
    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
      <Image
        source={{ uri: cloudinary.dynamicUrl(data.images[0], 'w_100') }}
        style={{ width: 50, height: 50, borderRadius: 10 }}
      />
      <View
        style={{
          flex: 1,
          marginLeft: 15,
          justifyContent: hasDescription ? 'flex-start' : 'center',
        }}
      >
        <Text
          level={6}
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginTop: hasDescription ? 3 : 0 }}
        >
          {data.name}
        </Text>
        {hasDescription && (
          <Text
            level={7}
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ marginTop: 2 }}
          >
            {data.description}
          </Text>
        )}
      </View>
      <View
        style={{ justifyContent: hasDescription ? 'flex-start' : 'center' }}
      >
        <Text
          level={6}
          weight="bold"
          style={{ marginTop: hasDescription ? 3 : 0 }}
        >
          {numberFormatter.toCurrency(data.price)}
        </Text>
      </View>
    </View>
  );
};
