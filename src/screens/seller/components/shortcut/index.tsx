import React, { ReactNode } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

// components
import Text from '../../../../components/text';
import Touchable from '../../../../components/touchable';
import Icon from '../../../../components/icon';
// styles
import colors from '../../../../styles/colors';

export interface ShortcutProps {
  image: ReactNode;
  title: string;
  style?: StyleProp<ViewStyle>;
  hasChevron?: boolean;
  onPress?: () => void;
}

export default ({
  image,
  title,
  style,
  hasChevron = false,
  onPress = () => null,
}: ShortcutProps) => {
  return (
    <Touchable onPress={onPress}>
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.blueLight3,
            borderRadius: 13,
            paddingVertical: 7,
            paddingHorizontal: 15,
          },
          style,
        ]}
      >
        {image}
        <Text
          level={5}
          weight="bold"
          color={colors.blue}
          style={{ flex: 1, marginLeft: 10 }}
        >
          {title}
        </Text>
        {hasChevron && (
          <Icon name="chevron-right" size={20} color={colors.blue} />
        )}
      </View>
    </Touchable>
  );
};
