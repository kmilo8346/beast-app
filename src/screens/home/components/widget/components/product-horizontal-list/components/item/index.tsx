import React, { memo, useState } from 'react';
import { View, Dimensions, GestureResponderEvent } from 'react-native';

// components
import Text from '../../../../../../../../components/text';
import Image from '../../../../../../../../components/image';
import Touchable from '../../../../../../../../components/touchable';
// lib
import cloudinary from '../../../../../../../../lib/cloudinary';
import numberFormatter from '../../../../../../../../lib/formatters/number-formatter';
// types
import { StoreProduct } from '../../../../../../../../types';
// styles
import colors from '../../../../../../../../styles/colors';

interface ComponentProps {
  navigation: any;
  data: StoreProduct;
  first: boolean;
  last: boolean;
}

export default memo(({ navigation, data, first, last }: ComponentProps) => {
  // state
  const [size] = useState((Dimensions.get('window').width * 0.85 - 20 * 2) / 2);

  // event handlers
  const goToProductScreen = (product: StoreProduct) => {
    navigation.navigate('Product', {
      product,
    });
  };

  // render logic
  return (
    <Touchable
      key={data.id}
      style={{ marginLeft: first ? 20 : 0, marginRight: last ? 20 : 0 }}
      onPress={(event: GestureResponderEvent) => {
        event.stopPropagation();
        goToProductScreen(data);
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: 5,
          zIndex: 9,
          bottom: 5,
          backgroundColor: colors.blackLight1,
          opacity: 0.8,
          paddingHorizontal: 5,
          paddingVertical: 3,
          borderRadius: 4,
        }}
      >
        <Text level={6} color={colors.white}>
          {numberFormatter.toCurrency(data.price)}
        </Text>
      </View>

      <Image
        source={{
          uri: cloudinary.dynamicUrl(data.images[0], 'h_500'),
          width: size,
          height: size,
        }}
        style={{
          borderRadius: 8,
          marginRight: 3,
        }}
      />
    </Touchable>
  );
});
