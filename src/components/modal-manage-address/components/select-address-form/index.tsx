import React from 'react';
import { View } from 'react-native';

import Button from '../../../button';
import Text from '../../../text';
import { Address } from '../../../../containers/user';
import styles from "./styles";

export interface SelectAddressFormProps {
    onSelect: (address: Address) => void;
}

export default ({ onSelect }: SelectAddressFormProps) => {

    const pressHandler = () => {
        onSelect({ street: 'Vic Mack', number: '626', apartment: '926' })
    }
    return (
        <View>
            <Text>Select address component</Text>
            <Button
                title="Seleccionar"
                onPress={pressHandler}
            />
        </View>
    );
}