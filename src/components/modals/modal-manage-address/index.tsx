import React, { useState } from 'react';
import { View } from 'react-native';

// components
import Modal, { ModalProps } from '../modal';
import SelectFriendly from '../../select-friendly';
// local components
import { AddAddressForm } from './components';
// clients
import userClient from '../../../clients/user-client';
// libs
import * as utils from '../../../lib/utils';
// containers
import UserProvider from '../../../containers/user';
// types
import { Place } from '../../../types';
// styles
import globalStyle from '../../../styles';

// instances outside component
const prefix = '[modal manage address component]';

export default (props: ModalProps) => {
  // state
  const [isFormVisible, setIsFormVisible] = useState(false);
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();
  // preconditions
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  if (!user.currentAddress) {
    throw new Error(`${prefix} User current address must be defined`);
  }
  const addresses = user.addresses;
  const currentAddress = user.currentAddress;

  // event handlers
  const addHandler = (place: Place) => {
    userClient.update(
      user.id,
      {
        addresses: utils.replaceOrAdd(
          addresses,
          place,
          (i1, i2) => i1.id === i2.id
        ),
      },
      new Date().getTime()
    );
    setIsFormVisible(false);
  };
  const selectHandler = (key: string) => {
    userClient.update(
      user.id,
      {
        currentAddress: key,
      },
      new Date().getTime()
    );
  };
  const deleteHandler = (key: string) => {
    const array = addresses.filter((address) => address.id !== key);
    userClient.update(
      user.id,
      {
        currentAddress: array[0].id,
        addresses: array,
      },
      new Date().getTime()
    );
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
