import React, { useReducer, Fragment } from 'react';
import { View } from 'react-native';

import { Address } from '../../containers/user';
import Modal, { ModalProps } from '../modal';
import { AddAddressForm, SelectAddressForm } from './components';

import globalStyle from '../../styles';

type AddAddressAction = { type: 'add_address', address: Address };
type Action = AddAddressAction;

type State = {
    currentAddress: Address;
    addresses: Address[];
}

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'add_address':

            return { ...state, addresses: [...(state.addresses || []), action.address] }
    }
}

export interface ModalManageAddresProps extends ModalProps {
    currentAddress: Address;
    addresses: Address[];
    onSave: (currentAddress: Address, addresses: Address[]) => void;
}

export default ({ currentAddress, addresses, onSave, ...modalProps }: ModalManageAddresProps) => {
    const [state, dispatch] = useReducer(reducer, { currentAddress, addresses });

    const addHandler = (address: Address) => {
        if (!state.addresses?.length) {
            onSave(address, [address])
        } else {
            dispatch({ type: 'add_address', address })
        }
    }

    const selectHandler = (address: Address) => {
        // console.log(address);
    }


    let title = "Agrega una dirección";
    let content = <AddAddressForm onAdd={addHandler} />;

    if (state.addresses?.length) {
        title = "Selecciona una dirección";
        content = <SelectAddressForm onSelect={selectHandler} />
    }

    return (
        <Modal {...modalProps} title={title}>
            <View style={[globalStyle.withMargin]}>
                {content}
            </View>
        </Modal>
    );
}