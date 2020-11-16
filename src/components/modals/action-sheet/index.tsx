import React from 'react';
import { View, GestureResponderEvent, ViewStyle } from 'react-native';

import Modal, { ModalProps } from '../modal';
import Button from '../../buttons/button';
import globalStyle from '../../../styles';

export interface ActionSheetOption {
  key: string;
  type?: 'action' | 'destructive' | 'cancel';
  text: string;
  icon?: string;
}

export interface ActionSheetProps extends ModalProps {
  options: ActionSheetOption[];
  onCallAction: (key: string) => void;
}

export default ({ options, onCallAction, ...otherProps }: ActionSheetProps) => {
  let cancelOption: ActionSheetOption | null = null;
  const actions: ActionSheetOption[] = [];
  options.forEach((option) => {
    if (option.type === 'cancel') {
      cancelOption = option;
      return;
    }
    actions.push(option);
  });
  if (cancelOption) {
    actions.push(cancelOption);
  }

  const pressActionHandler = (key: string) => {
    onCallAction(key);
  };

  return (
    <Modal
      statusBarTranslucent
      {...otherProps}
      draggable={false}
      modalStyle={{ backgroundColor: 'transparent' }}
    >
      <View style={[globalStyle.withMargin]}>
        {actions.map((action) => {
          const buttonStyle: ViewStyle[] = [{ marginBottom: 5 }];
          let buttonType: 'primary' | 'secondary' = 'primary';
          switch (action.type) {
            case 'destructive':
              buttonStyle.push({});
              break;
            case 'cancel':
              buttonStyle.push({ marginTop: 8 });
              buttonType = 'secondary';
              break;
            default:
              buttonStyle.push({});
              break;
          }
          return (
            <Button
              key={action.key}
              type={buttonType}
              title={action.text}
              icon={action.icon}
              style={buttonStyle}
              onPress={(event: GestureResponderEvent) => {
                event.stopPropagation();
                pressActionHandler(action.key);
              }}
            />
          );
        })}
      </View>
    </Modal>
  );
};
