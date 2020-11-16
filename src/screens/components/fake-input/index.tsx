import React from 'react';
import { GestureResponderEvent, View } from 'react-native';

// components
import Text from '../../../components/text';
import Icon from '../../../components/icon';
import Touchable from '../../../components/touchable';
// styles
import colors from '../../../styles/colors';

interface ComponentProps {
  label: string;
  placeholder: string;
  value: string;
  required: boolean;
  suffix: string;
  errors?: string[];
  onPress: () => void;
}

export default ({
  label,
  placeholder,
  value,
  required,
  suffix,
  errors,
  onPress,
}: ComponentProps) => {
  // event handlers
  const pressHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress();
  };

  // render logic
  const error = Array.isArray(errors) && errors.length ? errors[0] : null;
  let text = (
    <Text level={6} color={colors.blackLight4}>
      {placeholder}
    </Text>
  );
  if (value) {
    text = (
      <Text
        level={6}
        numberOfLines={2}
        ellipsizeMode="tail"
        style={{ lineHeight: 20, marginRight: 29 }}
      >
        {value}
      </Text>
    );
  }
  return (
    <View style={{ marginBottom: 12 }}>
      <Text level={6} style={{ marginLeft: 4 }}>
        {label}
        {required && <Text level={6} color={colors.red}>{` *`}</Text>}
      </Text>
      <Touchable onPress={pressHandler}>
        <View
          style={{
            borderStyle: 'solid',
            borderBottomWidth: 1,
            borderBottomColor: colors.blackLight6,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 4,
            paddingRight: 0,
          }}
        >
          {text}
        </View>
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
          }}
        >
          <Icon name={suffix} style={{ marginRight: 5 }} />
        </View>
      </Touchable>
      <Text
        level={8}
        color={colors.red}
        style={{ marginTop: 3, marginLeft: 4 }}
      >
        {error || ' '}
      </Text>
    </View>
  );
};
