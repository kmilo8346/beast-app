/* eslint-disable @typescript-eslint/no-empty-interface */
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from 'react';
import { View } from 'react-native';

// components
import Text from '../text';
import Touchable from '../touchable';
// styles
import styles from './styles';

// TODO: create toast type designs with anny

interface ToastData {
  message: string;
  action?: string | JSX.Element;
  actionCallback?: () => void;
  expiration?: number;
  type?: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR';
}
interface InternalToastData extends ToastData {
  id: string;
  timeoutId: null | number;
}

export type IToast = {
  show: (data: ToastData) => void;
};

type Ref = IToast;

export interface ToastProps {}

export default forwardRef<Ref, ToastProps>((props, ref) => {
  // state
  const [toasts, setToasts] = useState<InternalToastData[]>([]);

  // event handlers
  const showHandler = (data: ToastData): void => {
    const toastData: InternalToastData = {
      ...data,
      id: `${new Date().getTime()}`,
      type: 'INFO',
      timeoutId: null,
    };

    if (toastData.expiration) {
      // install setTimeout
      toastData.timeoutId = setTimeout(() => {
        if (toastData.timeoutId) {
          clearTimeout(toastData.timeoutId);
        }

        // delete from list
        setToasts((prevToasts) =>
          prevToasts.filter((toast) => toast.id !== toastData.id)
        );
      }, toastData.expiration * 1000);
    }

    // add to list
    setToasts((prevToasts) => [...prevToasts, toastData]);
  };
  const pressActionHandler = (toastData: InternalToastData) => {
    if (toastData.timeoutId) {
      clearTimeout(toastData.timeoutId);
    }

    setToasts((prevToasts) =>
      prevToasts.filter((toast) => toast.id !== toastData.id)
    );

    if (toastData.actionCallback) {
      toastData.actionCallback();
    }
  };
  useImperativeHandle(ref, () => ({
    show: showHandler,
  }));
  useEffect(() => {
    return () => {
      toasts.forEach((toast) => {
        if (toast.timeoutId) {
          clearTimeout(toast.timeoutId);
        }
      });
    };
  }, []);

  // render logic
  return (
    <View>
      {toasts.map((toastData, index, array) => {
        let toastAction = null;
        if (toastData.action) {
          let actionComponent = toastData.action;
          if (typeof toastData.action === 'string') {
            actionComponent = <Text level={6}>{toastData.action}</Text>;
          }
          toastAction = (
            <Touchable
              onPress={() => {
                pressActionHandler(toastData);
              }}
            >
              {actionComponent}
            </Touchable>
          );
        }
        const finalToastStyle = [styles.toast];
        if (index === array.length - 1) {
          finalToastStyle.push({
            marginBottom: 0,
          });
        }
        return (
          <View key={toastData.id} style={finalToastStyle}>
            <Text
              level={6}
              weight="bold"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.message}
            >
              {toastData.message}
            </Text>
            {toastAction}
          </View>
        );
      })}
    </View>
  );
});
