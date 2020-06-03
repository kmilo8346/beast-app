import React, { ReactNode } from 'react';
import { View } from 'react-native';

import Touchable, { TouchableProps } from '../touchable';
import Text from '../text';
import Icon from '../icon';
import styles from "./styles";
import colors from '../../styles/colors';

export interface ButtonProps extends Partial<TouchableProps> {
    title: string | ReactNode,
    icon?: string,
    disabled?: boolean,
    type?: 'primary' | 'secondary' | 'link',
    children?: ReactNode
}

export default ({ title, icon = undefined, type = 'primary', ...otherProps }: ButtonProps) => {
    const containerStyle = [styles.container];
    switch (type) {
        case 'secondary':
            containerStyle.push(styles['container_secondary']);
            break;
        case 'link':
            containerStyle.push(styles['container_link']);
            break;
        default:
            containerStyle.push(styles['container_primary']);
            break;
    }
    const titleStyle = [];
    switch (type) {
        case 'secondary':
            titleStyle.push(styles['title_secondary']);
            break;
        case 'link':
            titleStyle.push(styles['title_link']);
            break;
        default:
            titleStyle.push(styles['title_primary']);
            break;
    }
    let titleComponent: any = <Text level={5} weight="bold" style={titleStyle}>{title}</Text>;
    if (typeof title !== 'string') {
        titleComponent = title;
    }
    return (
        <Touchable style={containerStyle} {...otherProps}>
            {titleComponent}
            <View style={styles.iconContainer}>
                {icon && <Icon name={icon} color={colors.white} style={styles.icon} />}
            </View>
        </Touchable>
    );
}
