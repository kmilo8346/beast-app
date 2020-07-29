import React from 'react';
import { Feather, FontAwesome } from '@expo/vector-icons';

const awesome = ['whatsapp', 'bicycle'];

export default ({ name, ...otherProps }: any) => {
  if (awesome.indexOf(name) !== -1) {
    return <FontAwesome name={name} size={24} {...otherProps} />;
  }
  return <Feather name={name} size={24} {...otherProps} />;
};
