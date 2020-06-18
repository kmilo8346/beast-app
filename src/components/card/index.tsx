import React from 'react';
import { View, Image } from 'react-native';

import { Payment } from '../../types';
import Text from '../text';
import styles from "./styles";

export interface CardProps {
    data?: Payment;
}
const defaultCardData: Payment = {
    id: `p_${new Date().getTime()}`,
    type: 'Crédito',
    cardNumber: '7469373993833029',
    cardHolder: 'MARIAN CAPOTE P',
    validDate: '0323',

}
export default ({ data = defaultCardData }: CardProps) => {
    const { id, type, cardNumber, cardHolder, validDate } = data;
    const num1 = cardNumber.slice(0, 4);
    const num2 = cardNumber.slice(4, 8);
    const num3 = cardNumber.slice(8, 12);
    const num4 = cardNumber.slice(12);

    const validMonth = validDate.slice(0, 2);
    const validYear = validDate.slice(2);


    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text level={6} style={styles.cardType}>{type}</Text>
                <View style={styles.chipContainer}>
                    <Image
                        style={styles.chip}
                        source={require('../../../assets/items/card_ship.png')}
                    />
                    <Image
                        style={styles.chip}
                        source={require('../../../assets/items/wifi.png')}
                    />
                </View>
                <View style={styles.numberLogo}>
                    <View style={styles.numbers}>
                        <Text level={3} style={styles.number}>{`${num1} ${num2} ${num3} ${num4}`}</Text>
                    </View>
                    <Image
                        style={styles.logo}
                        source={require('../../../assets/items/mastercard_logo.png')}
                    />
                </View>
                <View style={styles.validCodeContainer}>
                    <View style={styles.validCodSection}>
                        <Text level={7} style={styles.number}>Válido hasta:</Text>
                        <Text level={7} style={styles.dateCod}>{`${validMonth} / ${validYear}`}</Text>
                    </View>
                    <View style={styles.validCodSection}>
                        <Text level={7} style={styles.number}>Cod:</Text>
                        <Text level={7} style={styles.dateCod}>096</Text>
                    </View>
                </View>
                <Text level={6} weight="bold" style={styles.cardHolder}>{cardHolder}</Text>
            </View>
        </View>
    );
}