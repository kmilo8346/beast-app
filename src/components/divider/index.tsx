import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

// styles
import colors from '../../styles/colors';

interface ComponentProps {
  type?: 'thin' | 'thick';
  style?: StyleProp<ViewStyle>;
}

export default ({ type = 'thin', style }: ComponentProps) => {
  // computed
  let height = 1;
  if (type === 'thick') {
    height = 10;
  }

  // render logic
  return (
    <View
      style={[
        { width: '100%', height, backgroundColor: colors.blackLight8 },
        style,
      ]}
    />
  );
};
