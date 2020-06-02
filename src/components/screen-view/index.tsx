import React, { ReactNode, Fragment } from 'react';
import { View, ViewStyle, StyleProp } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import Space from '../space';
import globalStyles from '../../styles'
import styles from './styles';

export interface Props {
    safeArea?: boolean,
    withMargin?: boolean,
    withPadding?: boolean,
    withFakeHeader?: boolean,
    style?: StyleProp<ViewStyle>,
    children: ReactNode
}

export default ({ safeArea = false, withMargin = false, withPadding = false, withFakeHeader = false, style = {}, children }: Props) => {
    // creating content
    let content = children;
    if (withFakeHeader) {
        content = <Fragment>
            <Space.FakeHeader />
            {children}
        </Fragment>
    }

    // creating style
    const containerStyle = [styles.container];
    if (withMargin) {
        containerStyle.push(globalStyles.withMargin)
    }
    if (withPadding) {
        containerStyle.push(globalStyles.withPadding)
    }
    containerStyle.push(style)

    // creating container
    let Container: any = <View style={containerStyle}>{content}</View>;
    if (safeArea) {
        Container = <SafeAreaView style={containerStyle}>{content}</SafeAreaView>;
    }

    return <View style={styles.wrapper}>{Container}</View>
};
