import React from 'react';

import { ScreenView, Text } from '../../components';
// import styles from "./styles";

export interface Props {
    navigation: any
}

export default ({ navigation }: Props) => {
    return (
        <ScreenView safeArea withMargin withFakeHeader>
            <Text weight="bold">Vender</Text>
        </ScreenView>
    );
}