import React from 'react';
import { View, Image } from 'react-native';

// components
import { Modal, ModalProps, Text, Touchable } from '../../../../../components';
// styles
import globalStyles from '../../../../../styles';

const productsImage = require('../../../../../../assets/icons/tag_with_background.png');
const servicesImage = require('../../../../../../assets/icons/hand_shake_with_background.png');

export interface ModalSelectProductTypeProps extends ModalProps {
  onSelect?: (type: string) => void;
}

export default ({
  onSelect = () => null,
  ...otherProps
}: ModalSelectProductTypeProps) => {
  // render logic
  return (
    <Modal {...otherProps} title="¿Que te gustaría publicar?">
      <View
        style={[
          {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 45,
          },
          globalStyles.withMargin,
        ]}
      >
        <Touchable
          onPress={() => {
            onSelect('product');
          }}
        >
          <View>
            <Image
              source={productsImage}
              style={{ width: 104, height: 104, marginBottom: 10 }}
            />
            <Text level={5} weight="bold" style={{ textAlign: 'center' }}>
              Productos
            </Text>
          </View>
        </Touchable>
        <Touchable
          onPress={() => {
            onSelect('service');
          }}
        >
          <View>
            <Image
              source={servicesImage}
              style={{ width: 104, height: 104, marginBottom: 10 }}
            />
            <Text level={5} weight="bold" style={{ textAlign: 'center' }}>
              Servicios
            </Text>
          </View>
        </Touchable>
      </View>
    </Modal>
  );
};
