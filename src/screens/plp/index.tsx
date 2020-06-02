import React from 'react';
import { View } from 'react-native';

import { ScreenView, Button } from '../../components';
import { Item } from './components'
// import styles from "./styles";

export interface Props {
    navigation: any
}

export default ({ navigation }: Props) => {
    return (
        <ScreenView style={{ justifyContent: "center" }}>
            <Item />
            <View style={{ height: 30 }}></View>
            <Button title="Llamar +56 9 64570608" icon="phone-call" />
            <View style={{ height: 30 }}></View>
            <Button title="Hacer Pedido" />
            <View style={{ height: 30 }}></View>
            <Button title="Cancelar" type="secondary" />
            <View style={{ height: 30 }}></View>
            <Button title="Vaciar carrito" type="link" />
            {/* <Button title="Go to pdp" onPress={() => { navigation.navigate('PDP') }} /> */}
        </ScreenView>
    );
}