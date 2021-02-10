import React from 'react';
import { Image, ImageProps, ImageStyle, StyleProp } from 'react-native';

// styles
import colors from '../../styles/colors';

export default ({ ...props }: ImageProps) => {
  const { style } = props;
  let s: StyleProp<ImageStyle> = { backgroundColor: colors.blackLight6 };
  if (style) {
    if (Array.isArray(style)) {
      s = [...style, s];
    } else {
      s = [style, s];
    }
  }
  return <Image {...props} style={s} />;
};
