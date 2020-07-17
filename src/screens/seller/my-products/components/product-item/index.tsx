import React from 'react';
import { Image, View, GestureResponderEvent } from 'react-native';

// components
import { Touchable, Text } from '../../../../../components';
// types
import { Product } from '../../../../../types';
// libs
import numberFormatter from '../../../../../lib/formatters/number-formatter';
// styles
import colors from '../../../../../styles/colors';

export interface ProductItemProps {
  data: Product;
  onPress?: () => void;
}

export default ({ data, onPress = () => null }: ProductItemProps) => {
  // event handlers
  const pressHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress();
  };
  // render logic
  const image = data.images[0];
  return (
    <Touchable style={{ flexDirection: 'row' }} onPress={pressHandler}>
      <Image
        source={{ uri: image }}
        style={{ width: 55, height: 55, borderRadius: 10 }}
      />
      <View style={{ flex: 1, marginHorizontal: 10 }}>
        <Text level={5} weight="bold">
          {data.name}
        </Text>
        <Text level={6} color={colors.blackLight5}>
          {numberFormatter.toCurrency(data.price)}
        </Text>
      </View>
    </Touchable>
  );
};
