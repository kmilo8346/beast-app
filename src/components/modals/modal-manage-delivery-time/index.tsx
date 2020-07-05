import React, { useState } from 'react';
import { View } from 'react-native';

// components
import Modal, { ModalProps } from '../modal';
// local components
import { AddDeliveryTimeForm } from './components';
// containers
import UserProvider from '../../../containers/user';
// types
import { DeliveryTime } from '../../../types';
// styles
import globalStyle from '../../../styles';

export default (props: ModalProps) => {
  // state
  const [isFormVisible, setIsFormVisible] = useState(false);
  const userContainer = UserProvider.useContainer();

  // event handlers
  const addHandler = (deliveryTime: DeliveryTime) => {
    // userContainer.addDeliveryTime(deliveryTime);
    setIsFormVisible(false);
  };


  return (
    <Modal {...props} title={'Tiempo de entrega'}>
      <View style={[globalStyle.withMargin]}>
        <AddDeliveryTimeForm onAdd={addHandler} />
      </View>
    </Modal>
  );
};
