import React, { useReducer } from 'react';
import { View } from 'react-native';
import validate from 'validate.js';

import Button from '../../../button';
import Input from '../../../input';
import { Address } from '../../../../containers/user';
import globalStyle from '../../../../styles';

type ChangeValueAction = { type: 'change_value', attribute: string, value: any };
type ValidateValueAction = { type: 'validate_value', attribute: string, value: any };
type Action = ChangeValueAction | ValidateValueAction;

type State = {
    form: { [key: string]: any },
    errors: { [key: string]: string[] }
}

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'change_value':
            return { ...state, form: { ...state.form, [action.attribute]: action.value } };
        case 'validate_value':
            let error = [];
            switch (action.attribute) {
                case 'street':
                    error = validate.single(action.value, {
                        presence: {
                            allowEmpty: false,
                            message: 'Dirección es requerida'
                        }
                    })
                    break;
                default:
                    break;
            }
            return { ...state, errors: { ...state.errors, [action.attribute]: error } };
    }
}

export interface AddAddressFormProps {
    onAdd: (address: Address) => void;
}

export default ({ onAdd }: AddAddressFormProps) => {
    const [state, dispatch] = useReducer(reducer, { form: {}, errors: {} });

    const changeHandler = (attribute: string, value: any) => {
        dispatch({ type: 'change_value', attribute, value })
        dispatch({ type: 'validate_value', attribute, value })
    }
    const addHandler = () => {
        onAdd({
            id: `${new Date().getTime()}`,
            street: state.form.street,
            number: '927',
            apartment: state.form.apartment,
        })
    }

    return (
        <View>
            <Input
                placeholder="Jose Pedro Alessandri 927"
                label="Dirección"
                value={state.form.street}
                errors={state.errors.street}
                onChangeText={text => { changeHandler('street', text) }}
            />
            <Input
                placeholder="1009"
                label="Departamento"
                value={state.form.apartment}
                onChangeText={text => { changeHandler('apartment', text) }}
            />
            <Button
                disabled={!state.form.street}
                title="Agregar"
                onPress={addHandler}
                style={globalStyle.withMainActionAir}
            />
        </View>
    );
}