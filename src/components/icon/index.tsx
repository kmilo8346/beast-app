import React from 'react';
import { Feather, FontAwesome } from '@expo/vector-icons';

const awesome = ['whatsapp'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default ({ name, ...otherProps }: any) => {
  if (awesome.indexOf(name) !== -1) {
    return <FontAwesome size={24} {...otherProps} />;
  }
  return <Feather size={24} {...otherProps} />;
};
