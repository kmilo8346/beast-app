import React from 'react';
import { View } from 'react-native';

import Touchable from '../touchable';
import Icon from '../icon';
import Text from '../text';
import styles from "./styles";

export interface InputNumberProps {
  value: number,
  min?: number,
  max?: number,
  showValue?: boolean,
  type?: 'regular' | 'dark',
  onChange?: (value: number) => void,
}

export default ({ value, min = 0, showValue = false, type = 'regular', max = Number.MAX_SAFE_INTEGER, onChange = () => null }: InputNumberProps) => {

  const minusPressHandler = () => {
    const decremented = value - 1;
    if (decremented < min) return;

    onChange(decremented);
  };

  const plusPressHandler = () => {
    const incremented = value + 1;
    if (incremented >= max) return;

    onChange(incremented);
  };

  let containerStyle = [styles.container];
  let minusStyle = [styles.minus];
  let plusStyle = [styles.plus];
  let iconsStyle = [styles.icons];

  if (type === 'dark') {
    containerStyle.push(styles.container_dark);
    minusStyle.push(styles.minus_dark);
    plusStyle.push(styles.plus_dark);
    iconsStyle.push(styles.icons_dark);
  };

  return (
    <View style={containerStyle}>
      <Touchable onPress={minusPressHandler} style={minusStyle}>
        <Icon name="minus" style={iconsStyle} />
      </Touchable>
      {showValue && <Text level={5}>{value}</Text>}
      <Touchable onPress={plusPressHandler} style={plusStyle}>
        <Icon name="plus" style={iconsStyle} />
      </Touchable>
    </View>
  );
};
