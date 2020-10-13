import React, { memo } from 'react';
import { Dimensions, GestureResponderEvent, View, Image } from 'react-native';

// components
import Touchable from '../../../../components/touchable';
import Text from '../../../../components/text';
// lib
import cloudinary from '../../../../lib/cloudinary';
import numberFormatter from '../../../../lib/formatters/number-formatter';
// types
import { Product } from '../../../../types';

interface ComponentProps {
  product: Product;
  align: 'left' | 'right';
  onPress: (product: Product) => void;
}

export default memo(({ product, align, onPress }: ComponentProps) => {
  // event handlers
  const pressProductHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress(product);
  };

  // render logic
  const size = (Dimensions.get('window').width / 2 - 20) * 0.95;
  return (
    <Touchable
      onPress={pressProductHandler}
      style={{ width: '50%', marginBottom: 10 }}
    >
      <View
        style={{ alignSelf: align === 'right' ? 'flex-end' : 'flex-start' }}
      >
        <Image
          source={{
            uri: cloudinary.dynamicUrl(product.images[0], 'h_500'),
          }}
          style={[
            {
              borderRadius: 8,
              width: size,
              height: size,
            },
          ]}
        />
      </View>
      <View
        style={{
          width: size,
          alignSelf: align === 'right' ? 'flex-end' : 'flex-start',
          paddingTop: 5,
        }}
      >
        <Text
          level={7}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginLeft: 5 }}
        >
          {product.name}
        </Text>
        <Text level={7} weight="bold" style={{ marginLeft: 5 }}>
          {numberFormatter.toCurrency(product.price)}
        </Text>
      </View>
    </Touchable>
  );
});
