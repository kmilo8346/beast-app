import React from 'react';
import { View } from 'react-native';

// components
import Text from '../../../../components/text';
import Button from '../../../../components/buttons/button';
import Divider from '../../../../components/divider';
// local components
import Dialog from '../dialog';
// lib
import * as utils from '../../../../lib/utils';
// styles
import globalStyle from '../../../../styles';

export interface DialogInfoProps {
  title: string;
  message: string;
  okText?: string;
  onOk?: () => void;
}

export default ({
  title,
  message,
  okText = 'OK',
  onOk = utils.noop,
}: DialogInfoProps) => {
  // event handlers
  const okPressHandler = () => {
    onOk();
  };

  // render logic
  return (
    <Dialog>
      <View
        style={[
          globalStyle.withPadding,
          {
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 25,
          },
        ]}
      >
        <Text
          level={5}
          weight="bold"
          style={{ textAlign: 'center', lineHeight: 23 }}
        >
          {title}
        </Text>
        <Text
          level={6}
          weight="light"
          style={{ marginBottom: 20, marginTop: 5, textAlign: 'center' }}
        >
          {message}
        </Text>
        <Divider />
        <Button
          title={okText}
          type="link"
          style={{ marginVertical: 15 }}
          onPress={okPressHandler}
        />
      </View>
    </Dialog>
  );
};
