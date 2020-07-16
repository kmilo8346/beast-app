import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

// components
import Icon from '../icon';
import Text from '../text';
import Touchable from '../touchable';
// styles
import colors from '../../styles/colors';

export interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export default ({
  label,
  checked,
  onChange = () => null,
  style,
}: CheckboxProps) => {
  // event handlers
  const pressHandler = () => {
    onChange(!checked);
  };

  // render logic
  let icon = null;
  let labelComponent = null;
  if (checked) {
    icon = <Icon name="check" size={16} color={colors.blackLight1} />;
  }
  if (label) {
    labelComponent = (
      <Text level={5} style={{ marginLeft: 10 }}>
        {label}
      </Text>
    );
  }
  return (
    <Touchable onPress={pressHandler} style={[{ flexDirection: 'row' }, style]}>
      <View style={{ borderWidth: 1, borderColor: colors.blackLight2 }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.blackLight4,
            margin: 2,
            width: 17,
            height: 17,
          }}
        >
          {icon}
        </View>
      </View>
      {labelComponent}
    </Touchable>
  );
};
