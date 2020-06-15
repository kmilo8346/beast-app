import React, { useState } from 'react';
import { View, ViewStyle, StyleProp, Linking } from 'react-native';

import Button from '../button';
import Text from '../../text';
import ActionSheet from '../../modals/action-sheet';
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
        <ActionSheet
          options={[
            {
              key: 'call_phone',
              text: 'Llamar al vendedor',
              icon: 'phone-call',
            },
            {
              key: 'sms',
              text: 'SMS al vendedor',
              icon: 'message-square',
            },
            {
              key: 'message_whatsapp',
              text: 'Mensaje al vendedor',
              icon: 'whatsapp',
            },
            { key: 'cancel', text: 'Cerrar', icon: 'x', type: 'cancel' },
          ]}
          onRequestClose={() => {
            setIsVisible(false);
          }}
          onCallAction={async (key) => {
            try {
              switch (key) {
                case 'call_phone':
                  await Linking.openURL(`tel: ${phone}`);
                  break;
                case 'sms':
                  await Linking.openURL(`sms: ${phone}`);
                  break;
                case 'message_whatsapp':
                  await Linking.openURL(`https://wa.me/${phone}`);
                  break;
                default:
                  break;
              }
            } catch (error) {
              // TODO: register error
            } finally {
              setIsVisible(false);
            }
          }}
        />
      )}
    </View>
  );
};
