import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  View,
  Modal,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';

// components
import CheckBlueIcon from '../svgs/images/check-blue';
// styles
import colors from '../../styles/colors';

let showResolve: () => void;
let hideResolve: () => void;

export enum LoadingStatus {
  OK = 'ok',
}

export type ILoadingOverlay = {
  show: () => Promise<void>;
  status: (status: LoadingStatus) => void;
  hide: () => Promise<void>;
};

type Ref = ILoadingOverlay;

export interface LoadingOverlayProps {
  containerStyle?: StyleProp<ViewStyle>;
}

export default forwardRef<Ref, LoadingOverlayProps>(
  ({ containerStyle }, ref) => {
    // state
    const [isVisible, setIsVisible] = useState(false);
    const [status, setStatus] = useState<LoadingStatus | undefined>();

    // event handlers
    const showHandler = () => {
      showResolve && showResolve();
    };

    const dismissHandler = () => {
      hideResolve && hideResolve();
    };

    useImperativeHandle(ref, () => ({
      show: async () => {
        return new Promise((resolve) => {
          showResolve = resolve;
          setIsVisible(true);
        });
      },
      status: async (status: LoadingStatus) => {
        setStatus(status);
      },
      hide: async () => {
        return new Promise((resolve) => {
          hideResolve = resolve;

          if (!status) {
            setIsVisible(false);
          } else {
            setTimeout(() => {
              setIsVisible(false);
              // reset status
              setStatus(undefined);
            }, 1000);
          }
        });
      },
    }));

    // render logic
    let component = <ActivityIndicator size="small" color={colors.white} />;
    if (status === LoadingStatus.OK) {
      component = <CheckBlueIcon width={50} height={50} />;
    }
    return (
      <Modal
        transparent
        visible={isVisible}
        animationType="fade"
        statusBarTranslucent
        onShow={showHandler}
        onDismiss={dismissHandler}
      >
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
          {component}
        </View>
      </Modal>
    );
  }
);
