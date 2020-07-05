import React, { useState, useCallback } from 'react';
import { View } from 'react-native';

// components
import InputSelect from '../input-select';
import ModalManageDeliveryTime from '../../modals/modal-manage-delivery-time';
// containers
import UserProvider from '../../../containers/user';
// types
import { IntegerRange } from '../../../types';

// TODO: mostrar un mensaje mas nice, ex; Entregas entre 1:20 y 3:20 horas

// Entregas entre 1:20 y 3:20 horas
// Entrega entre 20 minutos y 2:30 horas

export default () => {
  // state
  const [isVisible, setIsVisible] = useState(false);
  const userContainer = UserProvider.useContainer();
  const store = userContainer.getStore();

  // event handlers
  const inputPressHandler = useCallback(() => {
    setIsVisible(true);
  }, []);
  const requestCloseHandler = useCallback(() => {
    setIsVisible((prevIsVisible) => !prevIsVisible);
  }, []);
  const saveHandler = (deliveryTime: IntegerRange) => {
    userContainer.updateStore({
      deliveryTime,
    });
    setIsVisible((prevIsVisible) => !prevIsVisible);
  };

  // render logic
  let text = 'Tiempo de entrega';
  if (store?.deliveryTime) {
    text = `Entregas entre ${store.deliveryTime.lte} y ${store.deliveryTime.gte} minutos`;
  }
  return (
    <View>
      <InputSelect text={text} onPress={inputPressHandler} />
      {isVisible && (
        <ModalManageDeliveryTime
          deliveryTime={store?.deliveryTime}
          onSave={saveHandler}
          onRequestClose={requestCloseHandler}
        />
      )}
    </View>
  );
};
