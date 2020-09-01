import React, { ReactNode } from 'react';
import { View } from 'react-native';

// components
import Text from '../../../../../components/text';
import Touchable from '../../../../../components/touchable';
import Icon from '../../../../../components/icon';
// styles
import colors from '../../../../../styles/colors';

export interface LinkProps {
  image: ReactNode;
  title: string;
  onPress?: () => void;
}

export default ({ image, title, onPress = () => null }: LinkProps) => {
  return (
    <Touchable onPress={onPress}>
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
        {image}
        <Text level={5} style={{ flex: 1, marginLeft: 10 }}>
          {title}
        </Text>
        <Icon name="chevron-right" size={20} />
      </View>
    </Touchable>
  );
};
