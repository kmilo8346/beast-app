import React, { ReactNode } from 'react';
import { View, ViewStyle, Modal, ModalProps } from 'react-native';

// lib
import * as utils from '../../../../lib/utils';
// styles
import colors from '../../../../styles/colors';

export interface DialogProps extends ModalProps {
  children?: ReactNode;
  containerStyle?: ViewStyle;
  onClose?: () => void;
}
export default ({
  containerStyle,
  children,
  onClose = utils.noop,
  ...otherProps
}: DialogProps) => {
  // event handlers
  const dismissHandler = () => {
    onClose();
  };

  const requestCloseHandler = () => {
    onClose();
  };

  // render logic
  return (
    <Modal
      {...otherProps}
      animationType="fade"
      transparent
      visible
      onRequestClose={requestCloseHandler}
      onDismiss={dismissHandler}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.modalBackdrop,
        }}
      >
        <View
          style={[
            {
              backgroundColor: colors.white,
              borderRadius: 10,
              minWidth: 320,
              maxWidth: 400,
              width: '80%',
            },
            containerStyle,
          ]}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
};
