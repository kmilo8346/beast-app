import React from 'react';
import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';

const awesome = ['whatsapp', 'bicycle', 'undo'];
const awesome5 = ['store'];

export default ({ name, ...otherProps }: any) => {
  if (awesome.indexOf(name) !== -1) {
    return <FontAwesome name={name} size={24} {...otherProps} />;
  }
  if (awesome5.indexOf(name) !== -1) {
    return <MaterialIcons name={name} size={24} {...otherProps} />;
  }
  return <Feather name={name} size={24} {...otherProps} />;
};
