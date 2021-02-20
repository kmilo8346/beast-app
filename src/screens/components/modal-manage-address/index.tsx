import React, { useState } from 'react';
import { View } from 'react-native';
import isEqual from 'lodash.isequal';

// screen components
import AddressInputModal from '../address-input/components/address-input-modal';
// components
import Modal from '../../../components/modals/modal';
import SelectFriendly from '../../../components/select-friendly';
// libs
import * as utils from '../../../lib/utils';
// types
import { Place, AddressInfo } from '../../../types';
// styles
import globalStyles from '../../../styles';

interface ComponentProps {
  value: AddressInfo;
  onChange: (value?: AddressInfo) => void;
  onClose: () => void;
}

export default ({ value, onChange, onClose }: ComponentProps) => {
  // state
  const [info, setInfo] = useState(value);
  const [inputModal, setInputModal] = useState(false);

  // event handlers
  const addHandler = (place: Place) => {
    const current_address = place.id;
    const addresses = utils.replaceOrAdd(
      info?.addresses || [],
      place,
      (i1, i2) => i1.id === i2.id
    );
    onChange({
      current_address,
      addresses,
    });
  };

  const selectHandler = (key: string) => {
    setInfo((prevInfo) => ({
      ...(prevInfo as AddressInfo),
      current_address: key,
    }));
  };

  const deleteHandler = (key: string) => {
    setInfo((prevInfo) => {
      const addresses = (prevInfo as AddressInfo).addresses.filter(
        (address) => address.id !== key
      );
      return {
        current_address: addresses[0].id,
        addresses,
      };
    });
  };

  const addOptionHandler = () => {
    setInputModal(true);
  };

  const requestCloseHandler = () => {
    if (isEqual(value, info)) {
      // not change detected
      onClose();
    } else {
      // change detected
      onChange(info);
    }
  };

  const addressInputModalChangeHandler = (address: Place) => {
    addHandler(address);
  };

  const addressInputModalCloseHandler = () => {
    setInputModal(false);
  };

  // render logic
  const options = info.addresses.map(
    (address: Place, _index: number, array: Place[]) => ({
      key: address.id,
      title: `${utils.formatPlace(address)}`,
      subtitle: address.apartment,
      readonly: array.length === 1,
    })
  );
  return (
    <Modal
      onRequestClose={requestCloseHandler}
      title="Selecciona una dirección"
    >
      <View style={globalStyles.modalSubtitleSpace} />
      <View style={[globalStyles.withMargin]}>
        <SelectFriendly
          value={info.current_address}
          options={options}
          addMessage="Ingresa una nueva dirección"
          addDisabled={options.length >= 5}
          onSelect={selectHandler}
          onDelete={deleteHandler}
          onAdd={addOptionHandler}
          style={{ marginBottom: 20 }}
        />
      </View>
      {inputModal && (
        <AddressInputModal
          onChange={addressInputModalChangeHandler}
          onClose={addressInputModalCloseHandler}
        />
      )}
    </Modal>
  );
};
