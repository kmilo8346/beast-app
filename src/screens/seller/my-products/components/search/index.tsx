import React from 'react';
import {
  View,
  TextInputProps,
  TextInput,
  StyleProp,
  ViewStyle,
} from 'react-native';

// components
import { Icon } from '../../../../../components';
// styles
import colors from '../../../../../styles/colors';

export interface SearchProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
}

export default ({ containerStyle, ...otherProps }: SearchProps) => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.blackLight6,
          borderRadius: 13,
          paddingHorizontal: 10,
          paddingVertical: 10,
        },
        containerStyle,
      ]}
    >
      <Icon name="search" color={colors.blackLight3} />
      <TextInput
        {...otherProps}
        style={[{ flex: 1, marginLeft: 10 }, otherProps.style]}
      />
    </View>
  );
};
