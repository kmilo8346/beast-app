import React from 'react';
import { View } from 'react-native';

import Touchable from '../touchable';
import Icon from '../icon';
import styles from "./styles";
import colors from '../../styles/colors';

export interface InputNumberProps {
    value: number,
    min?: number,
    max?: number,
    onChange?: (value: number) => void,
}

export default ({ value, min = 0, max = Number.MAX_SAFE_INTEGER, onChange = () => null }: InputNumberProps) => {

    const minusPressHandler = () => {
        const decremented = value - 1;
        if (decremented < min) return;

        onChange(decremented);
    };

    const plusPressHandler = () => {
        const incremented = value + 1;
        if (incremented >= max) return;

        onChange(incremented);
    };

    return (
        <View style={styles.container}>
            <Touchable onPress={minusPressHandler} style={styles.minus}>
                <Icon name="minus" color={colors.blue} />
            </Touchable>
            <Touchable onPress={plusPressHandler} style={styles.plus}>
                <Icon name="plus" color={colors.blue} />
            </Touchable>
        </View>
    );
}