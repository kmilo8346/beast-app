/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { View } from 'react-native';

// components
import Text from '../text';
import Button from '../buttons/button';
import SearchingManImage from '../svgs/images/searching-man';

export default () => {
  return (
    <View style={{ alignItems: 'center' }}>
      <SearchingManImage />
      <Text level={5} style={{ marginTop: 30, maxWidth: 300, lineHeight: 23 }}>
        <Text level={5} weight="bold">
          ¡Ups!
        </Text>{' '}
        no hay resultados para esta búsqueda. Intenta con otra palabra.
      </Text>
    </View>
  );
};
