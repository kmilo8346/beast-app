import React from 'react';
import { View } from 'react-native';

// components
import {
  Container,
  Text,
  Button,
  ButtonCart,
  InputSelectAddress,
  InputSelectCard,
} from '../../components';

export interface Props {
  navigation: any;
}

export default ({ navigation }: Props) => {
  // state

  return (
    <Container safeArea withMargin fakeHeader>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text level={1} weight="bold" style={{ marginBottom: 0 }}>
          Inicio
        </Text>
        <ButtonCart />
      </View>
      <View style={{ height: 40 }} />
      <InputSelectAddress />
      <View style={{ height: 40 }} />
      <InputSelectCard />
      <View style={{ height: 40 }} />
      <Button
        title="Go to PLP"
        onPress={() => {
          navigation.navigate('PLP');
        }}
        style={{ marginTop: 50 }}
      />
    </Container>
  );
};
