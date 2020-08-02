import React, { useState } from 'react';
import { View, GestureResponderEvent } from 'react-native';

// components
import { Button } from '../../../components';
// local components
import ModalPay from '../modal-pay';

export default () => {
  const [isVisible, setIsVisible] = useState(false);

  // event handlers
  const requestCloseHandler = () => {
    setIsVisible(false);
  };
  const pressPayHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setIsVisible(true);
  };
  // render logic
  return (
    <View>
      <Button title="Pagar" onPress={pressPayHandler} />
      {isVisible && <ModalPay onRequestClose={requestCloseHandler} />}
    </View>
  );
};
