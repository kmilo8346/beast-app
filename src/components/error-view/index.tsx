/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { View, Image } from 'react-native';

import Text from '../text';
import Button from '../buttons/button';

const errorImage = require('../../../assets/error.png');

export interface ErrorProps {
  onRetry?: () => void;
}

export default ({ onRetry = () => null }: ErrorProps) => {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ marginTop: '20%', alignItems: 'center' }}>
        <Image
          source={errorImage}
          style={{ width: 200, height: 200, marginBottom: 10 }}
        />
        <Text level={6} weight="bold" style={{ marginBottom: 15 }}>
          Ocurrió un error inesperado
        </Text>
        <Text level={6} style={{ marginBottom: 10 }}>
          El error fue registrado para su solución
        </Text>
        <Button title="Reintentar" type="link" onPress={onRetry} />
      </View>
    </View>
  );
};
