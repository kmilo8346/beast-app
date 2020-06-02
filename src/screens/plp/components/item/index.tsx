import React from 'react';
import { View, Image } from 'react-native';

import { Text } from '../../../../components';
import Badge from '../badge';
import colors from '../../../../styles/colors';
import styles from "./styles";

export interface Props {
}

export default ({ }: Props) => {
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
                <Text level={7}>$ 30.000</Text>
            </View>
        </View>
    );
}