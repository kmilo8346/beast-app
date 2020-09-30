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
  counter?: number;
  onPress?: () => void;
}

export default ({ image, title, counter, onPress = () => null }: LinkProps) => {
  // render logic
  let counterComponent: ReactNode | null = null;
  if (counter && counter > 0) {
    counterComponent = (
      <View
        style={{
          backgroundColor: colors.white,
          borderWidth: 2,
          borderColor: colors.blueLight2,
          borderRadius: 100,
          paddingVertical: 3,
          paddingHorizontal: 9,
          minHeight: 29,
          minWidth: 29,
          marginRight: 10,
        }}
      >
        <Text level={3} weight="bold" color={colors.blue}>
          {counter}
        </Text>
      </View>
    );
  }
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
        {counterComponent}
        <Icon name="chevron-right" size={20} />
      </View>
    </Touchable>
  );
};
