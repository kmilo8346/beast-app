import React from 'react';
import { View, Image } from 'react-native';

import styles from "./styles";
import Text from '../text';

export interface Props {
}

export default ({ }: Props) => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text level={6} style={styles.cardType}>Débito</Text>
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
                        <Text level={3} style={styles.number}>XXXX</Text>
                        <Text level={3} style={styles.number}>XXXX</Text>
                        <Text level={3} style={styles.number}>XXXX</Text>
                        <Text level={3} style={styles.number}>XXXX</Text>
                    </View>
                    <Image
                        style={styles.logo}
                        source={require('../../../assets/items/mastercard_logo.png')}
                    />
                </View>
                <View style={styles.validCodeContainer}>
                    <View style={styles.validCodSection}>
                        <Text level={7} style={styles.number}>Válido hasta:</Text>
                        <Text level={7} style={styles.dateCod}>03/23</Text>
                    </View>
                    <View style={styles.validCodSection}>
                        <Text level={7} style={styles.number}>Cod:</Text>
                        <Text level={7} style={styles.dateCod}>096</Text>
                    </View>
                </View>
                <Text level={6} weight="bold" style={styles.cardHolder}>{`MARIAN CAPOTE P.`}</Text>
            </View>
        </View>
    );
}