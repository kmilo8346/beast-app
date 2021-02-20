import React, { memo } from 'react';
import { GestureResponderEvent, View, ViewStyle } from 'react-native';

// components
import Text from '../../../../components/text';
import Icon from '../../../../components/icon';
import Image from '../../../../components/image';
import Divider from '../../../../components/divider';
import Touchable from '../../../../components/touchable';
// libs
import cloudinary from '../../../../lib/cloudinary';
import numberFormatter from '../../../../lib/formatters/number-formatter';
// types
import { Product } from '../../../../types';
// styles
import globalStyles from '../../../../styles';

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
      <View style={[containerStyle, globalStyles.withMargin]}>
        <Image
          source={{
            uri: cloudinary.dynamicUrl(data.images[0], 'w_500/q_80'),
          }}
          style={{
            width: 50,
            height: 50,
            borderRadius: 10,
          }}
        />
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text level={6} numberOfLines={1} ellipsizeMode="tail">
            {data.name}
          </Text>

          {data.description ? (
            <Text level={7} numberOfLines={1} ellipsizeMode="tail">
              {data.description}
            </Text>
          ) : (
            <View style={{ height: 3 }} />
          )}
          {text}
        </View>
        <Icon name="chevron-right" />
      </View>
      <Divider />
    </Touchable>
  );
});
