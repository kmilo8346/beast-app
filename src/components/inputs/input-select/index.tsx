import React, { memo } from 'react';
import { GestureResponderEvent } from 'react-native';

// components
import Touchable from '../../touchable';
import Text from '../../text';
import Icon from '../../icon';
// styles
import colors from '../../../styles/colors';

export interface InputSelectProps {
  text: string;
  onPress?: (event: GestureResponderEvent) => void;
}

export default memo(({ text, onPress = () => null }: InputSelectProps) => {
  return (
    <Touchable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: colors.blackLight6,
        borderRadius: 7,
      }}
    >
      <Text
        level={6}
        style={{ marginLeft: 15, marginRight: 3, flex: 1 }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {text}
      </Text>
      <Icon name="chevron-down" style={{ marginRight: 15 }} />
    </Touchable>
  );
});
