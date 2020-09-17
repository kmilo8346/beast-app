import React from 'react';
import { View } from 'react-native';

// components
import Text from '../../../../../components/text';
import AddCircleBlueIcon from '../../../../../components/svgs/icons/add-circle-blue';
// seller components
import Shortcut from '../../../components/shortcut';
// styles
import globalStyles from '../../../../../styles';

export interface NotDataProps {
  onCallAction?: () => void;
}

export default ({ onCallAction = () => null }: NotDataProps) => {
  return (
    <View style={globalStyles.withMargin}>
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
        image={<AddCircleBlueIcon />}
        title="Agregar nuevo producto"
        onPress={onCallAction}
      />
    </View>
  );
};
