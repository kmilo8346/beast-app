import React from 'react';
import { View } from 'react-native';

import { ScreenView, Button } from '../../components';
import { Item, Product } from './components';
// import styles from "./styles";


const item: Product = {
    kind: 'product',
    id: '239832kd',
    name: 'Pie de gauyaba',
    brand: 'Don Camilo',
    format: '1 un',
    image: require('../../../assets/items/cake.png'),
    price: 2000,
    qty: 1
};

export interface Props {
    navigation: any
}

export default ({ navigation }: Props) => {
    return (
        <ScreenView withMargin style={{ justifyContent: "center" }}>
            <Item data={item} />
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