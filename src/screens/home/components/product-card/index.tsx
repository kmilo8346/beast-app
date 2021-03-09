import React, { memo } from 'react';
import { Dimensions, GestureResponderEvent, View, Image } from 'react-native';

// components
import Touchable from '../../../../components/touchable';
import Text from '../../../../components/text';
// lib
import cloudinary from '../../../../lib/cloudinary';
import numberFormatter from '../../../../lib/formatters/number-formatter';
// types
import { StoreProduct } from '../../../../types';
import colors from '../../../../styles/colors';

const innerShadow = require('../../../../../assets/images/innershadow.png');

interface ComponentProps {
  product: StoreProduct;
  align: 'left' | 'right';
  onPress: (product: StoreProduct) => void;
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
        style={{
          alignSelf: align === 'right' ? 'flex-end' : 'flex-start',
        }}
      >
        <Image
          source={innerShadow}
          style={[
            {
              position: 'absolute',
              width: size,
              height: size,
              zIndex: 9,
              borderRadius: 8,
            },
          ]}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size,
            zIndex: 9,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 5,
            paddingTop: 5,
          }}
        >
          <Image
            source={{
              uri: cloudinary.dynamicUrl(
                product.store_info.images[0],
                'w_200,c_scale,q_auto,f_auto,fl_lossy'
              ),
              width: 30,
              height: 30,
            }}
            style={{ borderRadius: 100, resizeMode: 'cover' }}
          />
          <Text
            level={7}
            weight="bold"
            color={colors.white}
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              marginLeft: 4,
              flex: 1,
              letterSpacing: -0.2,
            }}
          >
            {product.store_info.name}
          </Text>
        </View>
        <Image
          source={{
            uri: cloudinary.dynamicUrl(
              product.images[0],
              'w_500,c_scale,q_auto,f_auto,fl_lossy'
            ),
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
