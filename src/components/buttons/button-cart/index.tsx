import React, { useState } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';

import Button from '../button';
import Text from '../../text';
import Modal from '../../modals/modal';
import Cart from '../../../containers/cart';
import numberFormatter from '../../../lib/formatters/number-formatter';
import colors from '../../../styles/colors';
import globalStyle from '../../../styles';

export interface ButtonCartProps {
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export default ({ containerStyle = {}, style = {} }: ButtonCartProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const cartContainer = Cart.useContainer();
  const stats = cartContainer.getStats();

  const finalContainerStyle: StyleProp<ViewStyle> = [
    { position: 'absolute', bottom: 0, right: 0, left: 0 },
    containerStyle,
  ];
  const finalStyle: StyleProp<ViewStyle> = [
    globalStyle.withMainActionAir,
    style,
  ];
  if (cartContainer.isEmpty()) {
    return null;
  }
  return (
    <View style={finalContainerStyle}>
      <Button
        title={
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Text level={4} weight="bold" color={colors.white}>
              {`(${stats.total}) `}
            </Text>
            <Text level={4} weight="bold" color={colors.white}>
              Carrito
            </Text>
            <View style={{ flex: 1 }} />
            <Text level={4} weight="bold" color={colors.white}>
              {numberFormatter.toCurrency(stats.ammount)}
            </Text>
          </View>
        }
        style={finalStyle}
        onPress={() => {
          setIsVisible((prevIsVisible) => !prevIsVisible);
        }}
      />
      {isVisible && (
        <Modal
          title="Carrito"
          type="full"
          onRequestClose={() => {
            setIsVisible((prevIsVisible) => !prevIsVisible);
          }}
        />
      )}
    </View>
  );
};
