import React, { useState } from 'react';
import { View } from 'react-native';

// components
import Modal from '../../../../components/modals/modal';
import SelectFriendly from '../../../../components/select-friendly';
// local components
import AddAddressForm from './components/add-address-form';
// libs
import * as utils from '../../../../lib/utils';
// types
import { Place, AddressInfo } from '../../../../types';
// styles
import globalStyle from '../../../../styles';

interface ComponentProps {
  value: AddressInfo;
  onChange: (value: AddressInfo) => void;
}

export default ({ value, onChange }: ComponentProps) => {
  // state
  const [info, setInfo] = useState<AddressInfo>(value);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // event handlers
  const addHandler = (place: Place) => {
    setInfo((prevInfo) => ({
      ...prevInfo,
      addresses: utils.replaceOrAdd(
        prevInfo.addresses,
        place,
        (i1, i2) => i1.id === i2.id
      ),
    }));
    setIsFormVisible(false);
  };

  const selectHandler = (key: string) => {
    setInfo((prevInfo) => ({ ...prevInfo, current_address: key }));
  };

  const deleteHandler = (key: string) => {
    setInfo((prevInfo) => {
      const addresses = prevInfo.addresses.filter(
        (address) => address.id !== key
      );
      return {
        current_address: addresses[0].id,
        addresses,
      };
    });
  };

  const addOptionHandler = () => {
    setIsFormVisible(true);
  };

  const requestCloseHandler = () => {
    onChange(info);
  };

  let title = 'Agregar dirección';
  let content = <AddAddressForm onAdd={addHandler} />;

  if (!isFormVisible && info.addresses.length && info.current_address) {
    title = 'Selecciona una dirección';
    const options = info.addresses.map(
      (address: Place, _index: number, array: Place[]) => ({
        key: address.id,
        title: `${address.route.short_name}`,
        subtitle: `${address.street_number.short_name}${
          address.apartment ? `, ${address.apartment}` : ''
        }, ${address.locality.short_name}`,
        readonly: array.length === 1,
      })
    );
    content = (
      <View>
        <SelectFriendly
          value={info.current_address}
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
    <Modal onRequestClose={requestCloseHandler} title={title}>
      <View style={[globalStyle.withMargin]}>{content}</View>
    </Modal>
  );
};
