import React from 'react';
import { StyleProp, ViewStyle, GestureResponderEvent } from 'react-native';

import Icon from '../icon';
import Touchable from '../touchable';
import styles from "./styles";

export interface ButtonIconProps {
    name: string;
    style?: StyleProp<ViewStyle>;
    iconStyles?: ViewStyle;
    onPress?: (event: GestureResponderEvent) => void;
};

export default ({ name, style = {}, iconStyles = {}, onPress = () => null }: ButtonIconProps) => {
    const touchableStyle = [styles.container, style];
    const iconStyle = [styles.icon, iconStyles];

    return (
        <Touchable style={touchableStyle} onPress={onPress}>
            <Icon name={name} style={iconStyle} />
        </Touchable>
    );
};