import React, { useState } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';

import Button from '../button';
import Text from '../../text';
import ActionSheetContact from '../../modals/action-sheet-contact';
import colors from '../../../styles/colors';
import globalStyle from '../../../styles';

export interface ButtonContactProps {
  phone: string;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export default ({
  phone,
  containerStyle = {},
  style = {},
}: ButtonContactProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const finalContainerStyle: StyleProp<ViewStyle> = [containerStyle];
  const finalStyle: StyleProp<ViewStyle> = [
    globalStyle.withMainActionAir,
    style,
  ];
  return (
    <View style={finalContainerStyle}>
      <Button
        title={
          <Text level={4} weight="bold" color={colors.white}>
            Contactar al vendedor
          </Text>
        }
        style={finalStyle}
        onPress={() => {
          setIsVisible((prevIsVisible) => !prevIsVisible);
        }}
      />
      {isVisible && (
        <ActionSheetContact
          phone={phone}
          onRequestClose={() => {
            setIsVisible(false);
          }}
        />
      )}
    </View>
  );
};
