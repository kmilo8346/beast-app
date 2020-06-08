import React, { useReducer } from 'react';
import { View } from 'react-native';

import { Address } from '../../containers/user';
import Modal, { ModalProps } from '../modal';
import SelectFriendly from '../select-friendly';
import Button from '../button';
import { AddAddressForm } from './components';

import globalStyle from '../../styles';

type AddAddressAction = { type: 'add_address'; address: Address };
type SelectAddressAction = { type: 'select_address'; key: string };
type DeleteAddressAction = { type: 'delete_address'; key: string };
type SetShowAddAction = { type: 'set_show_add'; showAdd: boolean };
type Action =
  | AddAddressAction
  | SelectAddressAction
  | DeleteAddressAction
  | SetShowAddAction;

type State = {
  currentAddress: Address;
  addresses: Address[];
  showAdd: boolean;
};

const reducer = (state: State, action: Action): State => {
  let currentAddress;
  let addresses;
  switch (action.type) {
    case 'add_address':
      return {
        ...state,
        addresses: [...(state.addresses || []), action.address],
      };
    case 'select_address':
      currentAddress = state.addresses.find(
        (address) => address.id === action.key
      );
      if (currentAddress) {
        return { ...state, currentAddress };
      }
      return state;
    case 'delete_address':
      addresses = state.addresses.filter(
        (address) => address.id !== action.key
      );
      [currentAddress] = addresses;
      return { ...state, currentAddress, addresses };
    case 'set_show_add':
      return { ...state, showAdd: action.showAdd };
    default:
      return state;
  }
};

export interface ModalManageAddresProps extends ModalProps {
  currentAddress: Address;
  addresses: Address[];
  onSave: (currentAddress: Address, addresses: Address[]) => void;
}

export default ({
  currentAddress,
  addresses,
  onSave,
  ...modalProps
}: ModalManageAddresProps) => {
  const [state, dispatch] = useReducer(reducer, {
    currentAddress,
    addresses,
    showAdd: false,
  });

  const addHandler = (address: Address) => {
    try {
      if (!state.addresses?.length) {
        onSave(address, [address]);
      } else {
        dispatch({ type: 'add_address', address });
      }
    } catch (error) {
      //
    } finally {
      dispatch({ type: 'set_show_add', showAdd: false });
    }
  };

  const saveHandler = () => {
    onSave(state.currentAddress, state.addresses);
  };

  let title = 'Agrega una dirección';
  let content = <AddAddressForm onAdd={addHandler} />;

  if (state.addresses?.length && !state.showAdd) {
    title = 'Selecciona una dirección';

    const options = state.addresses.map((address) => ({
      key: address.id,
      title: address.street,
      subtitle: `${address.number}, ${address.apartment}`,
    }));
    content = (
      <View>
        <SelectFriendly
          dontDeleteOne
          value={state.currentAddress.id}
          options={options}
          addMessage="Agrega una nueva dirección"
          onSelect={(key) => {
            dispatch({ type: 'select_address', key });
          }}
          onDelete={(key) => {
            dispatch({ type: 'delete_address', key });
          }}
          onAdd={() => {
            dispatch({ type: 'set_show_add', showAdd: true });
          }}
          style={{ marginBottom: 20 }}
        />
        <Button
          title="Guardar"
          onPress={saveHandler}
          style={globalStyle.withMainActionAir}
        />
      </View>
    );
  }

  return (
    <Modal {...modalProps} title={title}>
      <View style={[globalStyle.withMargin]}>{content}</View>
    </Modal>
  );
};
