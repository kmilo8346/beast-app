import React from 'react';
import { View, Image, ImageSourcePropType } from 'react-native';

// components
import { Text, Touchable, Icon } from '../../../../../components';
import colors from '../../../../../styles/colors';

export interface LinkProps {
  image: ImageSourcePropType;
  title: string;
}

export default ({ image, title }: LinkProps) => {
  return (
    <Touchable>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.blackLight6,
          borderRadius: 13,
          paddingVertical: 7,
          paddingHorizontal: 15,
          marginBottom: 12,
        }}
      >
        <Image source={image} style={{ width: 40, height: 40 }} />
        <Text level={5} style={{ flex: 1, marginLeft: 10 }}>
          {title}
        </Text>
        <Icon name="chevron-right" size={20} />
      </View>
    </Touchable>
  );
};
