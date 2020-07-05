import React from 'react';

// components
import { Container, Text } from '../../../components';

export interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // render logic
  return (
    <Container withPadding>
      <Text>Mercadopago signin</Text>
    </Container>
  );
};
