import React, { memo } from 'react';
import { GestureResponderEvent } from 'react-native';

// components
import Touchable from '../../touchable';
import Text from '../../text';
import Icon from '../../icon';
// styles
import styles from './styles';

export interface InputSelectProps {
  text: string;
  onPress?: (event: GestureResponderEvent) => void;
}

export default memo(({ text, onPress = () => null }: InputSelectProps) => {
  return (
    <Touchable onPress={onPress} style={styles.container}>
      <Text
        level={6}
        style={styles.text}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {text}
      </Text>
      <Icon name="chevron-down" style={styles.icon} />
    </Touchable>
  );
});
