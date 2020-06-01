import React from 'react';
import { Button, View } from 'react-native';

import { ScreenView, Text } from '../../components';
// import styles from "./styles";

export interface Props {
  navigation: any
}

export default ({ navigation }: Props) => {
  return (
    <ScreenView safeArea withMargin withFakeHeader>
      <Text level={1} weight="bold">Buscar</Text>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Button title="Go to plp" onPress={() => { navigation.navigate('PLP') }} />
      </View>
    </ScreenView>
  );
}