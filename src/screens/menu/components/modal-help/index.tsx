import React from 'react';
import { View, GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import Modal from '../../../../components/modals/modal';
import Text from '../../../../components/text';
import Button from '../../../../components/buttons/button';
// libs
import * as utils from '../../../../lib/utils';
// styles
import globalStyle from '../../../../styles';

interface ComponentProps {
  onClose?: () => void;
}

export default ({ onClose = utils.noop }: ComponentProps) => {
  const insets = useSafeAreaInsets();
  // event handlers
  const dismissHandler = () => {
    onClose();
  };

  const requestCloseHandler = () => {
    onClose();
  };

  const pressOkHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onClose();
  };

  // render logic
  return (
    <Modal
      onDismiss={dismissHandler}
      onRequestClose={requestCloseHandler}
      title="Ayuda"
    >
      <View style={[globalStyle.withMargin, globalStyle.withScreenAir]}>
        <Text level={5} style={{ lineHeight: 23 }}>
          Shop Shop es una herramienta gratis para que todos podamos comprar y
          vender productos de forma fácil. Si tienes un problema con tu pedido
          porfavor contacta a la tienda.
        </Text>
      </View>

      <View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingBottom: insets.bottom,
          },
          globalStyle.withMargin,
        ]}
      >
        <Button
          title="OK"
          style={globalStyle.withMainActionAir}
          onPress={pressOkHandler}
        />
      </View>
    </Modal>
  );
};
