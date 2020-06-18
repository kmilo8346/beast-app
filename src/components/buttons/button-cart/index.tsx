import React, { useState } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';

// components
import ButtonIcon from '../button-icon';
import ModalCart from '../../modals/modal-cart';
import Badge from '../../badge';
// containers
import Cart from '../../../containers/cart';

export interface ButtonCartProps {
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export default ({ containerStyle = {}, style = {} }: ButtonCartProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const cartContainer = Cart.useContainer();
  const ammount = cartContainer.getStats().total;

  if (cartContainer.isEmpty()) {
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
        onPress={() => {
          setIsVisible((prevIsVisible) => !prevIsVisible);
        }}
      />
      <Badge
        count={ammount}
        style={{ position: 'absolute', top: -5, right: -5 }}
      />
      {isVisible && (
        <ModalCart
          onRequestClose={() => {
            setIsVisible((prevIsVisible) => !prevIsVisible);
          }}
        />
      )}
    </View>
  );
};
