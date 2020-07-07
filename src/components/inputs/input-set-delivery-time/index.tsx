import React, { useState, useCallback } from 'react';
import { View } from 'react-native';

// components
import InputSelect from '../input-select';
import ModalManageDeliveryTime from '../../modals/modal-set-delivery-time';
// containers
import UserProvider from '../../../containers/user';
// types
import { IntegerRange } from '../../../types';
// formatters
import DurationFormatter from '../../../lib/formatters/duration-formatter';

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
    console.log(
      DurationFormatter.humanizeDurationRange(
        deliveryTime.lte,
        deliveryTime.gte
      )
    );
  };

  // render logic
  let text = 'Tiempo de entrega';
  if (store?.deliveryTime) {
    text = DurationFormatter.humanizeDurationRange(
      store.deliveryTime.lte,
      store.deliveryTime.gte
    );
  }
  return (
    <View>
      <InputSelect value={text} onPress={inputPressHandler} />
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
