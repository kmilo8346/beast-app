/* eslint-disable no-unused-expressions */
import React, { useRef } from 'react';
import {
  View,
  TextInputProps,
  TextInput,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';

import { ButtonIcon } from '../../../../components';
import colors from '../../../../styles/colors';

export interface InputSearchProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
}

export default ({
  containerStyle = {},
  style = {},
  value,
  ...inputProps
}: InputSearchProps) => {
  const input = useRef<TextInput>(null);
  const finalContainerStyle: StyleProp<ViewStyle> = [
    {
      position: 'relative',
      borderBottomWidth: 1,
      borderBottomColor: colors.blackLight6,
    },
    containerStyle,
  ];
  const finalStyle: StyleProp<TextStyle> = [
    { marginVertical: 10, marginLeft: 3, paddingRight: 28 },
    style,
  ];
  return (
    <View style={finalContainerStyle}>
      <TextInput {...inputProps} value={value} ref={input} style={finalStyle} />
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          justifyContent: 'center',
        }}
      >
        {!!value && (
          <ButtonIcon
            icon="x"
            iconStyle={{ fontSize: 18 }}
            onPress={() => {
              input.current?.clear();
              inputProps.onChangeText && inputProps.onChangeText('');
            }}
          />
        )}
      </View>
    </View>
  );
};
