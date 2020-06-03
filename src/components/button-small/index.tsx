import React, { ReactNode } from 'react';
import { View } from 'react-native';

import Touchable, { TouchableProps } from '../touchable';
import Text from '../text';
import styles from "./styles";
import colors from '../../styles/colors';

export interface ButtonSmallProps extends Partial<TouchableProps> {
    title: string,
    disabled?: boolean,
}

export default ({ title, disabled = false, style = {}, onPress = () => null }: ButtonSmallProps) => {
    const containerStyle = [styles.container, style];
    return (
        <Touchable style={containerStyle} onPress={onPress}>
            <Text level={6} color={colors.blue}>{title}</Text>
        </Touchable>
    );
}
