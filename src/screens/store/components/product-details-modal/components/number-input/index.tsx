import React from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';

// components
import Touchable from '../../../../../../components/touchable';
import Icon from '../../../../../../components/icon';
import Text from '../../../../../../components/text';
// libs
import * as utils from '../../../../../../lib/utils';
// styles
import colors from '../../../../../../styles/colors';

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
    if (decremented < 1) return;

    onChange(decremented);
  };

  const plusPressHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    const incremented = value + 1;
    if (incremented > max) return;

    onChange(incremented);
  };

  // render logic
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 10,
          paddingVertical: 9,
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
        style={{ paddingLeft: 17, paddingRight: 17 }}
      >
        <Icon
          name="minus"
          color={value > 1 ? colors.blue : colors.blueLight1}
        />
      </Touchable>
      <Text
        level={4}
        weight="bold"
        color={colors.blue}
        style={{ minWidth: 35, textAlign: 'center' }}
      >
        {value}
      </Text>
      <Touchable
        onPress={plusPressHandler}
        style={{ paddingLeft: 17, paddingRight: 17 }}
      >
        <Icon name="plus" color={colors.blue} />
      </Touchable>
    </View>
  );
};
