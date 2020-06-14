import React, { ReactNode } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Modal,
  NativeSyntheticEvent,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenView from '../../container';
import Text from '../../text';
import ButtonIcon from '../../buttons/button-icon';
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
                    <TouchableWithoutFeedback onPress={onRequestClose}>
                      <View style={styles.containerDrag}>
                        <View style={styles.dragIndicator} />
                      </View>
                    </TouchableWithoutFeedback>
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
