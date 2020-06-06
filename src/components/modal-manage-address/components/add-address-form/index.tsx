import React from 'react';
import { View } from 'react-native';

import Button from '../../../button';
import Text from '../../../text';
import { Address } from '../../../../containers/user';
import styles from "./styles";

export interface AddAddressFormProps {
    onAdd: (address: Address) => void;
}

export default ({ onAdd }: AddAddressFormProps) => {

    const pressHandler = () => {
        // OK - console.log('pressHandler called: ')
        onAdd({ street: 'Vic Mack', number: '626', apartment: '926' })
    }
    return (
        <View>
            <Text>Add address component</Text>
            <Button
                title="Agregar"
                onPress={pressHandler}
            />
        </View>
    );
}