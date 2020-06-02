import React, { useState, useEffect } from 'react';

import ButtonSmall from '../button-small'
import { NumberInput } from './components';
import { ViewStyle, StyleProp, View } from 'react-native';

export interface FriendlyInputNumberProps {
    value?: number,
    defaultValue?: number,
    max?: number,
    onChange?: (value: number) => void,
    style?: StyleProp<ViewStyle>,
}

export default ({ value = undefined, defaultValue = 0, max = Number.MAX_SAFE_INTEGER, onChange = () => null, style = {} }: FriendlyInputNumberProps) => {
    const [v, setV] = useState(value || defaultValue);
    useEffect(() => {
        setV(value || defaultValue)
    }, [value]);

    const changeHandler = (change: number): void => {
        setV(change);
        onChange(change)
    }

    const containerStyle = [style];
    let content = <ButtonSmall title="Agregar" onPress={() => { changeHandler(1) }}></ButtonSmall>
    if (v > 0) {
        content = <NumberInput value={v} min={0} max={max} onChange={changeHandler} />;
    }

    return <View style={containerStyle}>{content}</View>
}