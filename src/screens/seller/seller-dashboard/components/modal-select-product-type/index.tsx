import React from 'react';
import { View } from 'react-native';

// components
import Modal, { ModalProps } from '../../../../../components/modals/modal';
import Text from '../../../../../components/text';
import Touchable from '../../../../../components/touchable';
import HandShakeImage from '../../../../../components/svgs/images/hand-shake';
import TagBlueImage from '../../../../../components/svgs/images/tag-blue';
// styles
import globalStyles from '../../../../../styles';

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
            <TagBlueImage />
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
            <HandShakeImage />
            <Text level={5} weight="bold" style={{ textAlign: 'center' }}>
              Servicios
            </Text>
          </View>
        </Touchable>
      </View>
    </Modal>
  );
};
