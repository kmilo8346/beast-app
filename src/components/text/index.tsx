import React, { ReactNode } from 'react';
import { Text, TextStyle, TextProps as RTextProps } from 'react-native';

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

export interface TextProps extends RTextProps {
  level?: 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1;
  weight?:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
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
  const baseSyle: TextStyle = {
    fontSize: getFontSize(level),
    fontWeight: weight,
    color,
  };
  const containerStyle = [baseSyle, style];

  return (
    <Text style={containerStyle} {...otherProps}>
      {otherProps.children}
    </Text>
  );
};
