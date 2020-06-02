import React from 'react';
import { View, Image, ImageSourcePropType } from 'react-native';

import { Text, FriendlyInputNumber } from '../../../../components';
import Badge from '../badge';
import colors from '../../../../styles/colors';
import styles from "./styles";

export interface Service {
    kind: string,
    name: string,
    description: string,
    image: ImageSourcePropType,
    price: number | false,
}

export interface Product {
    kind: string,
    id: string,
    name: string,
    brand: string;
    format: string,
    image: ImageSourcePropType,
    price: number,
    qty: number
}

export interface ItemProps {
    data: Product | Service;
}

export default ({ data }: ItemProps) => {
    console.log(data)
    return (
        <View style={styles.container}>
            <View style={styles.leftContainer}>
                <Image source={require('../../../../../assets/items/cake.png')} />
                <Badge count={9} style={styles.badge} />
            </View>
            <View style={styles.centerContainer}>
                <Text level={7} style={styles.name}>Don Camilo · Pie de manzana con frutos secos</Text>
                <Text level={7} color={colors.blackLight3} style={styles.format}>1 un · $ 9.990</Text>
            </View>
            <View style={styles.rightContainer}>
                <Text level={7} style={styles.price}>$ 30.000</Text>
                <FriendlyInputNumber defaultValue={0} onChange={(v) => { }} style={styles.inputNumber} />
            </View>
        </View>
    );

}