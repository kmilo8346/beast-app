import React from 'react';
import { Button, View } from 'react-native';

import { ScreenView } from '../../components';
// import styles from "./styles";

export interface Props {
    navigation: any
}

export default ({ navigation }: Props) => {
    return (
        <ScreenView style={{ justifyContent: "center" }}>
            <Button title="Go to pdp" onPress={() => { navigation.navigate('PDP') }} />
        </ScreenView>
    );
}