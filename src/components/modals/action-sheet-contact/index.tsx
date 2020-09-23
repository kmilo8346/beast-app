import React from 'react';
import { Linking } from 'react-native';

// components
import ActionSheet from '../action-sheet';
// libs
import * as utils from '../../../lib/utils';
import { capture } from '../../../lib/sentry';

// instances outside component
const prefix = '[action sheet contact component]';

export interface ActionSheetContactProps {
  phone: string;
  onRequestClose?: () => void;
}

export default ({
  phone,
  onRequestClose = utils.noop,
}: ActionSheetContactProps) => {
  return (
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
      onRequestClose={onRequestClose}
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
          capture(prefix, 'Call action handler error', error);
        } finally {
          onRequestClose();
        }
      }}
    />
  );
};
