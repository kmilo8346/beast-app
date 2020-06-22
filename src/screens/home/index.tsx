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
  return (
    <Container safeArea withMargin fakeHeader>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text level={1} weight="bold" style={{ marginBottom: 10 }}>
          Buscar
        </Text>
        <ButtonCart />
      </View>
      <InputSelectAddress />
      <View style={{ height: 40 }} />
      <InputSelectCard />
      <Button
        title="Go to PLP"
        onPress={() => {
          navigation.navigate('PLP');
        }}
        style={{ marginTop: 100 }}
      />
    </Container>
  );
};
