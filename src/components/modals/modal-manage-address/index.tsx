import React, { useState } from 'react';
import { View } from 'react-native';

// components
import Modal, { ModalProps } from '../modal';
import SelectFriendly from '../../select-friendly';
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
  const currentAddress = userContainer.getCurrentAddressId();

  // event handlers
  const addHandler = (place: Place) => {
    userContainer.addAddress(place);
    setIsFormVisible(false);
  };
  const selectHandler = (key: string) => {
    userContainer.setCurrentAddress(key);
  };
  const deleteHandler = (key: string) => {
    userContainer.deleteAddress(key);
  };
  const addOptionHandler = () => {
    setIsFormVisible(true);
  };

  let title = 'Agregar dirección';
  let content = <AddAddressForm onAdd={addHandler} />;

  if (!isFormVisible && addresses.length && currentAddress) {
    title = 'Selecciona una dirección';
    const options = addresses.map(
      (address: Place, index: number, array: Place[]) => ({
        key: address.id,
        title: `${address.route.shortName}`,
        subtitle: `${address.streetNumber.shortName}${
          address.apartment ? `, ${address.apartment}` : ''
          }, ${address.locality.shortName}`,
        readonly: array.length === 1,
      })
    );
    content = (
      <View>
        <SelectFriendly
          value={currentAddress}
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
