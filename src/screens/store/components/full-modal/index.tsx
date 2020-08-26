import React, { ReactNode } from 'react';
import { Modal, GestureResponderEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// components
import Icon from '../../../../components/icon';
// lib
import * as utils from '../../../../lib/utils';
// styles
import colors from '../../../../styles/colors';
import { Touchable } from '../../../../components';

export interface FullModalProps {
  children: ReactNode;
  onClose?: () => void;
}

export default ({ children, onClose = utils.noop }: FullModalProps) => {
  // event handlers
  const pressCloseHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onClose();
  };

  const dismissHandler = () => {
    onClose();
  };

  const requestCloseHandler = () => {
    onClose();
  };

  // render logic
  return (
    <Modal
      animationType="slide"
      onDismiss={dismissHandler}
      onRequestClose={requestCloseHandler}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <Touchable
          style={{
            paddingLeft: 3,
            alignSelf: 'flex-end',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 17,
          }}
          onPress={pressCloseHandler}
        >
          <Icon name="x" />
        </Touchable>
        {children}
      </SafeAreaView>
    </Modal>
  );
};
