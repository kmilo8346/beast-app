import React from 'react';
import {
  Feather,
  FontAwesome,
  createIconSetFromFontello,
} from '@expo/vector-icons';

import fontelloConfig from '../../../assets/fonts/fontello/config.json';

const awesome = ['whatsapp'];
const fontello = ['store'];
const Fontello = createIconSetFromFontello(
  fontelloConfig,
  'fontello',
  'fontello.ttf'
);

export default ({ name, ...otherProps }: any) => {
  if (awesome.indexOf(name) !== -1) {
    return <FontAwesome name={name} size={24} {...otherProps} />;
  }
  if (fontello.indexOf(name) !== -1) {
    return <Fontello name={name} size={24} {...otherProps} />;
  }
  return <Feather name={name} size={24} {...otherProps} />;
};
