/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { View, Image, ImageSourcePropType } from 'react-native';

import Text from '../text';
import Button from '../button';

const notDataImage = require('../../../assets/not_data.png');

export interface NotDataProps {
  image?: ImageSourcePropType;
  title?: string;
  subtitle?: string;
  action?: string;
  onCallAction?: () => void;
}

export default ({
  image = notDataImage,
  title = 'No hay resultados',
  subtitle = 'Intenta una búsqueda diferente',
  action = '',
  onCallAction = () => null,
}: NotDataProps) => {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ marginTop: '20%', alignItems: 'center' }}>
        <Image
          source={image}
          style={{ width: 200, height: 200, marginBottom: 10 }}
        />
        <Text level={6} weight="bold" style={{ marginBottom: 15 }}>
          {title}
        </Text>
        <Text level={6} style={{ marginBottom: 10 }}>
          {subtitle}
        </Text>
        {!!action && (
          <Button title={action} type="link" onPress={onCallAction} />
        )}
      </View>
    </View>
  );
};
