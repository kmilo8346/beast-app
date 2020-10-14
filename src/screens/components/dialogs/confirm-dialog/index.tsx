import React from 'react';
import { GestureResponderEvent, View } from 'react-native';

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
import colors from '../../../../styles/colors';

interface ComponentProps {
  title: string;
  message?: string;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
}

export default ({
  title,
  message,
  okText = 'OK',
  cancelText = 'Cancelar',
  onOk = utils.noop,
  onCancel = utils.noop,
}: ComponentProps) => {
  // event handlers
  const pressOkHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onOk();
  };

  const pressCancelHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onCancel();
  };

  // render logic
  return (
    <Dialog>
      <View
        style={[
          globalStyle.withMargin,
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
          style={{ textAlign: 'center', lineHeight: 23, marginBottom: 5 }}
        >
          {title}
        </Text>
        {message ? (
          <Text
            level={6}
            weight="light"
            style={{ marginBottom: 20, textAlign: 'center' }}
          >
            {message}
          </Text>
        ) : (
          <View style={{ marginBottom: 10 }} />
        )}

        <Divider />
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 10,
            marginTop: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <Button
              title={cancelText}
              type="link"
              onPress={pressCancelHandler}
            />
          </View>
          <View
            style={{
              height: 30,
              width: 1,
              backgroundColor: colors.blackLight6,
            }}
          />
          <View style={{ flex: 1 }}>
            <Button
              title={okText}
              type="link"
              onPress={pressOkHandler}
              style={{ paddingHorizontal: 0 }}
            />
          </View>
        </View>
      </View>
    </Dialog>
  );
};
