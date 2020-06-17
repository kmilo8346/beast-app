import React, { useState } from 'react';
import { View } from 'react-native';

// components
import InputSelect from '../input-select';
import ModalManageAddress from '../../modals/modal-manage-address';
// containers
import UserProvider from '../../../containers/user';

export default () => {
  const [isVisible, setIsVisible] = useState(false);
  const userContainer = UserProvider.useContainer();

  const currentAddress = userContainer.getCurrentAddress();
  const addresses = userContainer.getAddresses();
  let text = 'Selecciona una dirección';
  if (currentAddress) {
    text = `Enviar a - ${currentAddress.route.shortName} ${
      currentAddress.streetNumber.shortName
    }${currentAddress.apartment ? ` · ${currentAddress.apartment}` : ''}`;
  }
  return (
    <View>
      <InputSelect
        text={text}
        onPress={() => {
          setIsVisible(true);
        }}
      />
      {isVisible && (
        <ModalManageAddress
          currentAddress={currentAddress}
          addresses={addresses}
          onSave={(currentAddress, addresses) => {
            userContainer.setCurrentAddress(currentAddress);
            userContainer.setAddresses(addresses);
            setIsVisible((prevIsVisible) => !prevIsVisible);
          }}
          onRequestClose={() => {
            setIsVisible((prevIsVisible) => !prevIsVisible);
          }}
        />
      )}
    </View>
  );
};
