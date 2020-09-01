import React, { ReactNode } from 'react';
import {
  View,
  Image,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
} from 'react-native';

// components
import Text from '../../../../components/text';
import Touchable from '../../../../components/touchable';
// styles
import colors from '../../../../styles/colors';

export interface ShortcutProps {
  image: ImageSourcePropType;
  title: string;
  counter?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export default ({
  image,
  title,
  counter,
  style,
  onPress = () => null,
}: ShortcutProps) => {
  // render logic
  let counterComponent: ReactNode | null = null;
  if (counter && counter > 0) {
    counterComponent = (
      <View
        style={{
          backgroundColor: colors.white,
          borderRadius: 100,
          paddingVertical: 2,
          paddingHorizontal: 10,
          minHeight: 29,
          minWidth: 29,
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
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.blueLight2,
            borderRadius: 13,
            paddingVertical: 7,
            paddingHorizontal: 15,
          },
          style,
        ]}
      >
        <Image source={image} style={{ width: 40, height: 40 }} />
        <Text
          level={5}
          weight="bold"
          color={colors.blue}
          style={{ flex: 1, marginLeft: 10 }}
        >
          {title}
        </Text>
        {counterComponent}
      </View>
    </Touchable>
  );
};
