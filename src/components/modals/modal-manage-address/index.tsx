import React, { useState } from 'react';
import { View } from 'react-native';

// components
import Modal, { ModalProps } from '../modal';
import SelectFriendly from '../../select-friendly';
import Button from '../../buttons/button';
// local components
import { AddAddressForm } from './components';
// containers
import UserProvider from '../../../containers/user';
// types
import { Place } from '../../../types';
// styles
import globalStyle from '../../../styles';

export default (props: ModalProps) => {
  // state
  const [isFormVisible, setIsFormVisible] = useState(false);
  const userContainer = UserProvider.useContainer();
  const addresses = userContainer.getAddresses();
  const currentAddress = userContainer.getCurrentAddress();

  // event handlers
  const addHandler = (place: Place) => {
    userContainer.addAddress(place);
    userContainer.setCurrentAddress(place);
    setIsFormVisible(false);
  };
  const selectHandler = (key: string) => {
    const match = addresses.find(address => address.id === key);
    userContainer.setCurrentAddress(match as Place);
  };
  const deleteHandler = (key: string) => {
    const addresses = userContainer.deleteAddress(key);
    let currentAddress = null;
    if (addresses.length) {
      currentAddress = addresses[0];
    }
    userContainer.setCurrentAddress(currentAddress);
  };
  const addOptionHandler = () => {
    setIsFormVisible(true);
  };

  let title = 'Agrega una dirección';
  let content = <AddAddressForm onAdd={addHandler} />;

  if (addresses?.length && !isFormVisible) {
    title = 'Selecciona una dirección';

    const options = addresses.map((address) => ({
      key: address.id,
      title: `${address.route.shortName}`,
      subtitle: `${address.streetNumber.shortName}${
        address.apartment ? `, ${address.apartment}` : ''
        }, ${address.locality.shortName}`,
    }));
    content = (
      <View>
        <SelectFriendly
          value={currentAddress?.id}
          options={options}
          addMessage="Agrega una nueva dirección"
          onSelect={selectHandler}
          onDelete={deleteHandler}
          onAdd={addOptionHandler}
          style={{ marginBottom: 20 }}
        />
      </View>
    );
  }

  return (
    <Modal {...props} title={title}>
      <View style={[globalStyle.withMargin]}>{content}</View>
    </Modal>
  );
};
