import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Modal, ViewStyle, StyleProp } from 'react-native';

// components
import Loading from '../loading';
// styles
import colors from '../../styles/colors';

export type ILoadingOverlay = {
  show: () => void;
  hide: () => void;
};

type Ref = ILoadingOverlay;

export interface LoadingOverlayProps {
  containerStyle?: StyleProp<ViewStyle>;
}

export default forwardRef<Ref, LoadingOverlayProps>(
  ({ containerStyle }, ref) => {
    // state
    const [isVisible, setIsVisible] = useState(false);
    // event handlers
    useImperativeHandle(ref, () => ({
      show: () => {
        setIsVisible(true);
      },
      hide: () => {
        setIsVisible(false);
      },
    }));
    return (
      <Modal visible={isVisible} animationType="fade" transparent>
        <View
          style={[
            {
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.modalBackdrop,
            },
            containerStyle,
          ]}
        >
          <Loading />
        </View>
      </Modal>
    );
  }
);
