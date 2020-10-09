import React from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';

// components
import Touchable from '../../../../components/touchable';
import Icon from '../../../../components/icon';
import Text from '../../../../components/text';
// libs
import * as utils from '../../../../lib/utils';
// styles
import colors from '../../../../styles/colors';

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
            paddingHorizontal: 38,
            paddingVertical: 7.2,
            borderWidth: 1,
            borderColor: colors.blueLight1,
            borderRadius: 8,
          },
          style,
        ]}
        onPress={plusPressHandler}
      >
        <Text
          level={5}
          weight="bold"
          color={colors.blue}
          style={{ letterSpacing: 0 }}
        >
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
          paddingVertical: 6,
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
      <Touchable onPress={minusPressHandler} style={{ paddingHorizontal: 16 }}>
        <Icon name="minus" color={colors.blue} />
      </Touchable>
      <Text
        level={4}
        weight="bold"
        color={colors.blue}
        style={{ minWidth: 35, textAlign: 'center' }}
      >
        {value}
      </Text>
      <Touchable onPress={plusPressHandler} style={{ paddingHorizontal: 16 }}>
        <Icon name="plus" color={colors.blue} />
      </Touchable>
    </View>
  );
};
