import React, { useState, useCallback } from 'react';
import { View } from 'react-native';

// components
import InputSelect from '../input-select';
import ModalManageDeliveryTime from '../../modals/modal-manage-delivery-time';
// containers
import UserProvider from '../../../containers/user';

export default () => {
  // state
  const [isVisible, setIsVisible] = useState(false);
  const userContainer = UserProvider.useContainer();
  const currentAddressId = userContainer.getCurrentAddressId();
  const adresses = userContainer.getAddresses();
  const currentAddress = adresses.find(
    (address) => address.id === currentAddressId
  );

  // event handlers
  const inputPressHandler = useCallback(() => {
    setIsVisible(true);
  }, []);
  const requestCloseHandler = useCallback(() => {
    setIsVisible((prevIsVisible) => !prevIsVisible);
  }, []);

  // render logic
  let text = 'Definir Tiempo de entrega';
  let deliveryFrom = '10'
  let deliveryTo = '30'
  if (currentAddress) {
    text = `Entregas tus pedidos de ${deliveryFrom} a ${deliveryTo} minutos`;
  }
  // if (currentAddress) {
  //   text = `Entrega de - ${currentAddress.route.shortName} ${
  //     currentAddress.streetNumber.shortName
  //     }${currentAddress.apartment ? ` · ${currentAddress.apartment}` : ''}`;
  // }
  return (
    <View>
      <InputSelect text={text} onPress={inputPressHandler} />
      {isVisible && <ModalManageDeliveryTime onRequestClose={requestCloseHandler} />}
    </View>
  );
};
