import React, { useReducer } from 'react';
import { View } from 'react-native';

// components
import Modal, { ModalProps } from '../modal';
import SelectFriendly from '../../select-friendly';
import Button from '../../buttons/button';
// local components
import { AddAddressForm } from './components';
// types
import { Place } from '../../../types';
// styles
import globalStyle from '../../../styles';

type AddAddressAction = { type: 'add_address'; address: Place };
type SelectAddressAction = { type: 'select_address'; key: string };
type DeleteAddressAction = { type: 'delete_address'; key: string };
type SetShowAddAction = { type: 'set_show_add'; showAdd: boolean };
type Action =
  | AddAddressAction
  | SelectAddressAction
  | DeleteAddressAction
  | SetShowAddAction;

type State = {
  currentAddress: Place | undefined;
  addresses: Place[];
  showAdd: boolean;
};

const reducer = (state: State, action: Action): State => {
  let currentAddress: Place | undefined;
  let addresses: Place[];
  let found = false;
  switch (action.type) {
    case 'add_address':
      currentAddress = state.currentAddress;
      addresses = [...state.addresses];

      addresses = addresses.map((address) => {
        if (address.id === action.address.id) {
          found = true;
          if (currentAddress?.id === action.address.id) {
            // replace current address
            currentAddress = action.address;
          }
          // replace in addresses
          return action.address;
        }
        return address;
      });
      if (!found) {
        addresses.push(action.address);
      }
      return {
        ...state,
        currentAddress,
        addresses,
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
  currentAddress: Place;
  addresses: Place[];
  onSave: (currentAddress: Place, addresses: Place[]) => void;
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

  const addHandler = (address: Place) => {
    try {
      if (!state.addresses?.length) {
        onSave(address, [address]);
      } else {
        dispatch({ type: 'add_address', address });
      }
    } finally {
      dispatch({ type: 'set_show_add', showAdd: false });
    }
  };

  let title = 'Agrega una dirección';
  let content = <AddAddressForm onAdd={addHandler} />;

  if (state.addresses?.length && !state.showAdd) {
    title = 'Selecciona una dirección';

    const options = state.addresses.map((address) => ({
      key: address.id,
      title: `${address.route.shortName}`,
      subtitle: `${address.streetNumber.shortName}${
        address.apartment ? `, ${address.apartment}` : ''
      }, ${address.locality.shortName}`,
    }));
    content = (
      <View>
        <SelectFriendly
          dontDeleteOne
          value={(state.currentAddress as Place).id}
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
          onPress={() => {
            onSave(state.currentAddress as Place, state.addresses);
          }}
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
