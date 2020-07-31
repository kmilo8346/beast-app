import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

// components
import { Touchable, Icon, Text } from '../../../../../components';
// libs
import * as utils from '../../../../../lib/utils';
// styles
import colors from '../../../../../styles/colors';

export type InputNumberStatus = 'success' | 'warning' | 'error';
export interface InputNumberProps {
  value: number;
  min: number;
  max: number;
  status: InputNumberStatus;
  style?: StyleProp<ViewStyle>;
  onChange?: (value: number) => void;
}

export default ({
  value,
  min,
  max,
  status,
  style,
  onChange = utils.noop,
}: InputNumberProps) => {
  // event handlers
  const minusPressHandler = () => {
    const decremented = value - 1;
    if (decremented < min) return;

    onChange(decremented);
  };

  const plusPressHandler = () => {
    const incremented = value + 1;
    if (incremented > max) return;

    onChange(incremented);
  };
  let containerStyle: StyleProp<ViewStyle> = {
    borderColor: colors.red,
    backgroundColor: colors.redLight1,
  };
  if (status === 'warning') {
    containerStyle = {
      borderColor: colors.yellow,
      backgroundColor: colors.yellowLight1,
    };
  } else if (status === 'success') {
    containerStyle = {
      borderColor: colors.green,
      backgroundColor: colors.greenLight1,
    };
  }
  // render logic
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderWidth: 1,

          borderRadius: 10,
          paddingVertical: 10,
        },
        containerStyle,
        style,
      ]}
    >
      <Touchable onPress={minusPressHandler} style={{ paddingHorizontal: 20 }}>
        <Icon name="minus" />
      </Touchable>
      <Text level={4} weight="bold">
        {`${value} de ${max}`}
      </Text>
      <Touchable onPress={plusPressHandler} style={{ paddingHorizontal: 20 }}>
        <Icon name="plus" />
      </Touchable>
    </View>
  );
};
