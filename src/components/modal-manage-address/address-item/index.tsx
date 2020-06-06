import React from 'react';
import { View, ViewStyle } from 'react-native';

import ButtonIcon from '../../button-icon';
import Icon from '../../icon';
import Text from '../../text';
import Touchable from '../../touchable';

import styles from "./styles";
import colors from '../../../styles/colors';
import { StyleProp } from 'react-native';

export interface AdressItemProps {
    address: {
        street?: string;
        number?: string;
        department?: string;
        comunne?: string;
        selected?: boolean;
    },
    style?: StyleProp<ViewStyle>;
}

export default ({ address, style = {} }: AdressItemProps) => {
    const containerStyles = [styles.container, style]
    return (
        <View style={containerStyles}>
            <Touchable style={styles.content}>
                <Icon name={address.selected ? 'check-circle' : 'circle'} />
                <View style={styles.address}>
                    <Text level={6}>{address.street}</Text>
                    <Text level={6} color={colors.blackLight3}>{`${address.number}, ${address.department}, ${address.comunne}`}</Text>
                </View>
            </Touchable>
            <ButtonIcon icon='trash-2' />
        </View>
    );
}