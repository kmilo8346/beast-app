import React from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';

// components
import Touchable from '../../../../../components/touchable';
import Icon from '../../../../../components/icon';
import Text from '../../../../../components/text';
// libs
import * as utils from '../../../../../lib/utils';
// styles
import colors from '../../../../../styles/colors';

export interface InputNumberProps {
  value: number;
  max?: number;
  style?: StyleProp<ViewStyle>;
  onChange?: (value: number) => void;
}

export default ({
  value,
  max = Number.MAX_SAFE_INTEGER,
  style,
  onChange = utils.noop,
}: InputNumberProps) => {
  // event handlers
  const minusPressHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    const decremented = value - 1;
    if (decremented < 0) return;

    onChange(decremented);
  };

  const plusPressHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    const incremented = value + 1;
    if (incremented > max) return;

    onChange(incremented);
  };

  // render logic
  if (value === 0) {
    return (
      <Touchable
        style={[
          {
            paddingHorizontal: 14,
            paddingVertical: 3,
            borderWidth: 1,
            borderColor: colors.blueLight1,
            borderRadius: 8,
          },
          style,
        ]}
        onPress={plusPressHandler}
      >
        <Text level={7} color={colors.blue} style={{ letterSpacing: -0.1 }}>
          Agregar
        </Text>
      </Touchable>
    );
  }
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 10,
          paddingVertical: 1,
          backgroundColor: colors.white,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.18,
          shadowRadius: 1.0,

          elevation: 1,
        },
        style,
      ]}
    >
      <Touchable
        onPress={minusPressHandler}
        style={{ paddingLeft: 10, paddingRight: 10 }}
      >
        <Icon name="minus" color={colors.blue} size={20} />
      </Touchable>
      <Touchable
        onPress={plusPressHandler}
        style={{ paddingLeft: 10, paddingRight: 10 }}
      >
        <Icon name="plus" color={colors.blue} size={20} />
      </Touchable>
    </View>
  );
};
