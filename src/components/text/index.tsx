import React, { ReactNode } from 'react';
import { Text, TextStyle, TextProps as RNTextProps } from 'react-native';

import colors from '../../styles/colors';

const getFontSize = (level: number): number => {
  switch (level) {
    case 2:
      return 24;
    case 3:
      return 20;
    case 4:
      return 18;
    case 5:
      return 16;
    case 6:
      return 14;
    case 7:
      return 12;
    case 8:
      return 10;
    default:
      return 30;
  }
};

export interface TextProps extends RNTextProps {
  level?: 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1;
  weight?: 'bold' | 'normal' | 'light';
  color?: string;
  children: ReactNode;
}

export default ({
  level = 1,
  weight = 'normal',
  style = {},
  color = colors.black,
  ...otherProps
}: TextProps) => {
  let fontFamily = 'MonserratNormal';
  switch (weight) {
    case 'bold':
      fontFamily = 'MonserratBold';
      break;
    case 'light':
      fontFamily = 'MonserratLight';
      break;
    default:
      break;
  }
  const baseStyle: TextStyle = {
    fontSize: getFontSize(level),
    color,
    fontFamily,
  };
  const containerStyle = [baseStyle, style];

  return (
    <Text style={containerStyle} {...otherProps}>
      {otherProps.children}
    </Text>
  );
};
