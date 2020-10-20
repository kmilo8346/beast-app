import React, { memo } from 'react';
import { GestureResponderEvent, Image, View, ViewStyle } from 'react-native';

// components
import Touchable from '../../../../../components/touchable';
import Text from '../../../../../components/text';
import Icon from '../../../../../components/icon';
import Divider from '../../../../../components/divider';
// libs
import cloudinary from '../../../../../lib/cloudinary';
import numberFormatter from '../../../../../lib/formatters/number-formatter';
// types
import { Product } from '../../../../../types';

interface ComponentProps {
  data: Product;
  navigation: any;
}

export default memo(({ data, navigation }: ComponentProps) => {
  // event handlers
  const pressHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('UpsertProduct', { product: data });
  };

  // render logic
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  };
  let text = (
    <Text level={6} weight="bold">
      {numberFormatter.toCurrency(data.price)}
    </Text>
  );
  if (!data.enabled) {
    text = (
      <Text level={6} weight="bold">
        No visible
      </Text>
    );
    containerStyle.opacity = 0.5;
  }
  return (
    <Touchable onPress={pressHandler}>
      <View style={containerStyle}>
        <Image
          source={{
            uri: cloudinary.dynamicUrl(data.images[0], 'w_500'),
          }}
          style={{
            width: 50,
            height: 50,
            borderRadius: 10,
          }}
        />
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text level={6} weight="bold" numberOfLines={1} ellipsizeMode="tail">
            {data.name}
          </Text>

          <Text level={7} numberOfLines={1} ellipsizeMode="tail">
            {data.description}
          </Text>
          {text}
        </View>
        <Icon name="chevron-right" />
      </View>
      <Divider />
    </Touchable>
  );
});
