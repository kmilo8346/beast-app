import React from 'react';
import { StyleProp, ViewStyle, GestureResponderEvent, TextStyle } from 'react-native';

import Icon from '../icon';
import Touchable from '../touchable';
import styles from "./styles";

export interface ButtonIconProps {
    icon: string;
    style?: StyleProp<ViewStyle>;
    iconStyle?: TextStyle;
    onPress?: (event: GestureResponderEvent) => void;
};

export default ({ icon, style = {}, iconStyle = {}, onPress = () => null }: ButtonIconProps) => {
    const touchableStyle = [styles.container, style];
    const _iconStyle = [styles.icon, iconStyle];

    return (
        <Touchable style={touchableStyle} onPress={onPress}>
            <Icon name={icon} style={_iconStyle} />
        </Touchable>
    );
};