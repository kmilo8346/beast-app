import React, { useReducer, useEffect, Fragment } from 'react';
import { View } from 'react-native';
import validate from 'validate.js';

import Modal, { ModalProps } from '../modal';
import Input from '../input';
import Button from '../button';
import Icon from '../icon';
import Text from '../text';
import Touchable from '../touchable';
import AddresItem from './address-item';

import globalStyle from '../../styles';

interface Address {
    street: string;
    department?: string;
}

interface User {
    selectedAddress: Address | null;
    addresses: Address[];
}

type ChangeValueAction = { type: 'change_value', attribute: string, value: any };
type ValidateAction = { type: 'validate', attribute: string, value: any };
type SaveAddresAction = { type: 'save_address', address: Address };
type Action = ChangeValueAction | ValidateAction | SaveAddresAction;

type State = {
    user: User,
    form: { [key: string]: any; },
    errors: { [key: string]: string[]; }
}

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'change_value':
            return { ...state, form: Object.assign({}, state.form, { [action.attribute]: action.value }) };
        case 'validate':
            const errors = { ...state.errors };
            if (action.attribute === 'street') {
                errors.street = validate.single(action.value, {
                    presence: {
                        allowEmpty: false,
                        message: 'Dirección es requerida'
                    }
                })
            }
            return { ...state, errors };
        case 'save_address':
            let user = { ...state.user }
            user.addresses.push(action.address);
            if (!user.selectedAddress) {
                user.selectedAddress = action.address;
            }
            return { ...state, form: {}, user };
    }
}

export interface ModalManageAddresProps extends ModalProps {
}

export default ({ ...modalProps }: ModalManageAddresProps) => {
    const [state, dispatch] = useReducer(reducer, { user: { addresses: [], selectedAddress: null }, form: {}, errors: {}, });

    const changeValueHandler = (attribute: string, value: any) => {
        dispatch({ type: 'change_value', attribute, value })
        dispatch({ type: 'validate', attribute, value })
    }


    let content = <Fragment>
        <Input
            label="Dirección"
            placeholder="Jose Pedro Alessandri 927"
            value={state.form.street}
            errors={state.errors.street}
            onChangeText={(text) => { changeValueHandler('street', text) }}
        />
        <Input
            label="Departamento"
            placeholder="1009"
            value={state.form.department}
            errors={state.errors.department}
            onChangeText={(text) => { changeValueHandler('department', text) }}
        />
    </Fragment>

    // Borrar desde aquí ----------------
    let savedAddresses = [
        {
            street: 'Ave. Vicuña Mackenna',
            number: '625',
            department: '926',
            comunne: 'Santiago',
            selected: true
        },
        {
            street: 'Callejón de los pajeros',
            number: '69',
            department: '1',
            comunne: 'Cojimar',
            selected: false
        },
        {
            street: 'Loma de Palo Cagao',
            number: '35',
            department: '50',
            comunne: 'La Sabahana',
            selected: false
        },
    ]

    // Borrar hasta aquí ----------------

    // if (state.user.addresses.length) {
    if (!!savedAddresses.length) {
        content = <>
            {
                savedAddresses.map((address, index) => <AddresItem style={index === savedAddresses.length - 1 ? { marginBottom: 19 } : {}} address={address} />)
            }
            <Touchable style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 50, paddingLeft: 18 }}>
                <Icon name={'plus'} />
                <Text level={6} style={{ marginLeft: 18 }}>Agregar una nueva dirección</Text>
            </Touchable>
        </>
    }
    return (
        <Modal {...modalProps} title={!savedAddresses.length ? "Agrega una dirección" : "Selecciona una dirección"}>
            <View style={[globalStyle.withMargin]}>
                {content}
                <Button
                    title="Guardar"
                    style={globalStyle.withMainActionAir}
                    onPress={() => {
                        dispatch({
                            type: 'save_address',
                            address: {
                                street: state.form.street, department: state.form.department
                            }
                        })
                    }} />
            </View>
        </Modal>
    );
}