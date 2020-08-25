import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

// styles
import colors from '../../styles/colors';

interface ComponentProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  marginLeft?: number;
  marginBottom?: number;
  style?: StyleProp<ViewStyle>;
}

export default ({
  width = '100%',
  height = 10,
  borderRadius = 10,
  marginLeft,
  marginBottom,
  style,
}: ComponentProps) => {
  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: colors.blackLight8,
          borderRadius,
          marginLeft,
          marginBottom,
        },
        style,
      ]}
    />
  );
};
