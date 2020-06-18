import React, { useState, memo, useCallback } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';

// components
import ButtonIcon from '../button-icon';
import ModalCart from '../../modals/modal-cart';
import Badge from '../../badge';
// containers
import Cart from '../../../containers/cart';

interface ContentProps {
  ammount: number;
  isEmpty: boolean;
  isModalVisible: boolean;
  containerStyle: StyleProp<ViewStyle>;
  style: StyleProp<ViewStyle>;
  onPressButton: () => void;
  onModalClose: () => void;
}

const Content = memo(
  ({
    ammount,
    isEmpty,
    isModalVisible,
    containerStyle,
    style,
    onPressButton,
    onModalClose,
  }: ContentProps) => {
    if (isEmpty) {
      return null;
    }

    const finalContainerStyle: StyleProp<ViewStyle> = [
      { position: 'relative', alignSelf: 'flex-start' },
      containerStyle,
    ];
    const finalStyle: StyleProp<ViewStyle> = [style];
    return (
      <View style={finalContainerStyle}>
        <ButtonIcon
          icon="shopping-cart"
          style={finalStyle}
          onPress={onPressButton}
        />
        <Badge
          count={ammount}
          style={{ position: 'absolute', top: -5, right: -5 }}
        />
        {isModalVisible && <ModalCart onRequestClose={onModalClose} />}
      </View>
    );
  }
);

export interface ButtonCartProps {
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export default ({ containerStyle, style }: ButtonCartProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const cartContainer = Cart.useContainer();
  const ammount = cartContainer.getStats().total;
  const isEmpty = cartContainer.isEmpty();

  const pressButtonHandler = useCallback(() => {
    setIsVisible((prevIsVisible) => !prevIsVisible);
  }, []);
  const modalCloseHandler = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <Content
      ammount={ammount}
      isEmpty={isEmpty}
      isModalVisible={isVisible}
      containerStyle={containerStyle}
      style={style}
      onPressButton={pressButtonHandler}
      onModalClose={modalCloseHandler}
    />
  );
};
