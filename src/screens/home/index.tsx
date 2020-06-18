import React from 'react';

// components
import {
  Container,
  Text,
  Button,
  ButtonCart,
  InputSelectAddress,
  InputSelectPayment
} from '../../components';

export interface Props {
  navigation: any;
}

export default ({ navigation }: Props) => {
  return (
    <Container safeArea withMargin fakeHeader>
      <Text level={1} weight="bold" style={{ marginBottom: 10 }}>
        Buscar
      </Text>
      <InputSelectAddress />
      <Text level={1}>.</Text>
      <InputSelectPayment />
      <Button
        title="Go to PLP"
        onPress={() => {
          navigation.navigate('PLP');
        }}
        style={{ marginTop: 100 }}
      />
      <ButtonCart />
    </Container>
  );
};
