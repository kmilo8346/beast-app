/* eslint-disable @typescript-eslint/no-empty-interface */
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from 'react';
import { View, ViewStyle, StyleProp, Vibration } from 'react-native';

// components
import Text from '../text';
import Icon from '../icon';
import Touchable from '../touchable';
// styles
import styles from './styles';
import colors from '../../styles/colors';

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

export interface ToastProps {
  containerStyle?: StyleProp<ViewStyle>;
}

export default forwardRef<Ref, ToastProps>(({ containerStyle }, ref) => {
  // state
  const [toasts, setToasts] = useState<InternalToastData[]>([]);

  // event handlers
  const showHandler = (data: ToastData): void => {
    const toastData: InternalToastData = {
      ...data,
      id: `${new Date().getTime()}`,
      type: data.type || 'INFO',
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

    // add to list but just keep 3
    setToasts((prevToasts) => {
      const array = [...prevToasts, toastData];
      return array.slice(Math.max(array.length - 3, 0));
    });

    if (data.type === 'ERROR') {
      Vibration.vibrate(400);
    }
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
    <View style={containerStyle}>
      {toasts.map((toastData, index, array) => {
        let toastAction = null;
        const finalToastStyle = [styles.toast];
        let icon = <Icon name="info" color={colors.white} />;
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
        if (index === array.length - 1) {
          finalToastStyle.push({
            marginBottom: 0,
          });
        }
        if (toastData.type === 'ERROR') {
          icon = <Icon name="info" color={colors.red} />;
        } else if (toastData.type === 'SUCCESS') {
          icon = <Icon name="info" color={colors.green} />;
        } else if (toastData.type === 'WARNING') {
          icon = <Icon name="info" color={colors.yellow} />;
        }
        return (
          <View key={toastData.id} style={finalToastStyle}>
            {icon}
            <View
              style={{
                alignSelf: 'stretch',
                borderWidth: 1,
                borderColor: colors.blackLight3,
                marginLeft: 7,
                marginRight: 10,
                borderRadius: 8,
              }}
            />
            <Text
              level={6}
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
