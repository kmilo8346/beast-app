import React, { ReactNode } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Modal,
  NativeSyntheticEvent,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// components
import ScreenView from '../../container';
import Text from '../../text';
import ButtonIcon from '../../buttons/button-icon';
import Icon from '../../icon';
import Touchable from '../../touchable';
// styles
import styles from './styles';

export interface ModalProps {
  type?: 'auto' | 'full';
  title?: string;
  draggable?: boolean;
  modalStyle?: ViewStyle;
  children?: ReactNode;
  onShow?: (event: NativeSyntheticEvent<any>) => void;
  onRequestClose?: () => void;
  onDismiss?: () => void;
}

export default ({
  type = 'auto',
  title = '',
  draggable = true,
  modalStyle = {},
  children = null,
  onShow = () => null,
  onRequestClose = () => null,
  onDismiss = () => null,
}: ModalProps) => {
  let content;
  switch (type) {
    case 'full':
      content = (
        <ScreenView
          safeArea
          style={[styles.modal, styles.modal_full, modalStyle]}
        >
          <View style={styles.header}>
            {title && (
              <Text level={2} weight="bold">
                {title}
              </Text>
            )}
            <View style={styles.closeContainer}>
              <ButtonIcon icon="x" onPress={onRequestClose} />
            </View>
          </View>
          {children}
        </ScreenView>
      );
      break;

    default:
      content = (
        <ScreenView wrapperStyle={styles.containerBackdrop}>
          <TouchableWithoutFeedback
            onPress={onRequestClose}
            style={styles.backdrop}
          >
            <View style={styles.containerModal}>
              <TouchableWithoutFeedback
                onPress={(e) => {
                  e.stopPropagation();
                }}
              >
                <View style={[styles.modal, styles.modal_auto, modalStyle]}>
                  {draggable && (
                    <>
                      <View style={{ marginBottom: 30 }} />
                      <Touchable
                        style={{
                          position: 'absolute',
                          top: 3,
                          right: 5,
                          padding: 10,
                          // borderWidth: 1,
                          alignSelf: 'flex-end',
                        }}
                        onPress={onRequestClose}
                      >
                        <Icon name="x" size={18} />
                      </Touchable>
                    </>
                  )}
                  <SafeAreaView style={styles.bodyContainer}>
                    {!!title && (
                      <Text level={3} weight="bold" style={styles.title}>
                        {title}
                      </Text>
                    )}
                    {children}
                  </SafeAreaView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </ScreenView>
      );
      break;
  }
  return (
    <Modal
      animationType="slide"
      transparent
      visible
      onShow={onShow}
      onRequestClose={onRequestClose}
      onDismiss={onDismiss}
    >
      {content}
    </Modal>
  );
};
