import React, { useReducer, useEffect, Fragment } from 'react';
import validate from 'validate.js';

import Modal, { ModalProps } from '../modal';
import Input from '../input';
import Button from '../button';
import Text from '../text';
import globalStyle from '../../styles';
import { View, KeyboardAvoidingView } from 'react-native';

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
    </Fragment>

    if (state.user.addresses.length) {
        content = <Text>Vista multiples direcciones</Text>
    }
    return (
        <Modal {...modalProps} title="Agrega una dirección">
            <View style={[globalStyle.withMargin]}>
                {content}
            </View>

        </Modal>
    );
}