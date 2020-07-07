import React, { useState, useCallback } from 'react';
import { View } from 'react-native';

// components
import InputSelect from '../input-select';
import ModalManageAddress from '../../modals/modal-manage-address';
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
  let text = 'Selecciona una dirección';
  if (currentAddress) {
    text = `Enviar a - ${currentAddress.route.shortName} ${
      currentAddress.streetNumber.shortName
    }${currentAddress.apartment ? ` · ${currentAddress.apartment}` : ''}`;
  }
  return (
    <View>
      <InputSelect value={text} onPress={inputPressHandler} />
      {isVisible && <ModalManageAddress onRequestClose={requestCloseHandler} />}
    </View>
  );
};
