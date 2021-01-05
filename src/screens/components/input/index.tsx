import React, { ReactNode } from 'react';
import { GestureResponderEvent, View } from 'react-native';

// components
import Icon from '../../../components/icon';
import Text from '../../../components/text';
import Touchable from '../../../components/touchable';
// libs
import * as utils from '../../../lib/utils';
// styles
import colors from '../../../styles/colors';

interface ComponentProps {
  label: string;
  placeholder?: string;
  value?: string | ReactNode;
  icon?: string | ReactNode;
  disabled?: boolean;
  onPress?: () => void;
}

export default ({
  label,
  placeholder,
  value,
  icon,
  disabled,
  onPress = utils.noop,
}: ComponentProps) => {
  // event handlers
  const pressInputHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress();
  };

  // render logic
  let textComponent: ReactNode = (
    <Text
      level={6}
      style={{ flex: 1, marginRight: 5, color: colors.blackLight4 }}
    >
      {placeholder}
    </Text>
  );
  let iconComponent: ReactNode = (
    <Icon name="chevron-right" color={colors.blackLight4} />
  );
  if (value) {
    textComponent = (
      <Text level={6} style={{ flex: 1, marginRight: 5, lineHeight: 23 }}>
        {value}
      </Text>
    );
    if (typeof value !== 'string') {
      textComponent = <View style={{ flex: 1, marginRight: 5 }}>{value}</View>;
    }
  }
  if (icon) {
    if (typeof icon === 'string') {
      iconComponent = <Icon name={icon} color={colors.blackLight4} />;
    } else {
      iconComponent = icon;
    }
  }
  if (typeof disabled !== 'undefined' && disabled) {
    iconComponent = null;
  }

  return (
    <View style={{ marginBottom: 20 }}>
      <Text level={6}>{label}</Text>
      <Touchable
        style={{
          borderColor: colors.blackLight8,
          borderBottomWidth: 1,
          paddingVertical: 10,
        }}
        onPress={pressInputHandler}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {textComponent}
          {iconComponent}
        </View>
      </Touchable>
    </View>
  );
};
