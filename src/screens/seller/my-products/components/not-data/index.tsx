import React from 'react';
import { View } from 'react-native';

// components
import Text from '../../../../../components/text';
// seller components
import Shortcut from '../../../components/shortcut';

const addProductImage = require('../../../../../../assets/icons/plus.png');

export interface NotDataProps {
  onCallAction?: () => void;
}

export default ({ onCallAction = () => null }: NotDataProps) => {
  return (
    <View>
      <Text
        level={2}
        weight="bold"
        style={{ marginBottom: 5, textAlign: 'center' }}
      >
        ¡Ups! no hay productos en tu tienda.
      </Text>
      <Text level={5} style={{ marginBottom: 15, textAlign: 'center' }}>
        ¡Agrega tu primer producto!
      </Text>
      <Shortcut
        image={addProductImage}
        title="Agregar nuevo producto"
        onPress={onCallAction}
      />
    </View>
  );
};
