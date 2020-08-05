import React, { useState, useCallback } from 'react';
import { View } from 'react-native';

// components
import InputSelect from '../input-select';
import ModalManageAddress from '../../modals/modal-manage-address';
// containers
import UserProvider from '../../../containers/user';

// instances outside component
const prefix = '[input select address component]';

export default () => {
  // state
  const [isVisible, setIsVisible] = useState(false);
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();
  // precondition
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  if (!user.currentAddress) {
    throw new Error(`${prefix} User current address must be defined`);
  }
  const currentAddressId = user.currentAddress;
  const adresses = user.addresses || [];
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
