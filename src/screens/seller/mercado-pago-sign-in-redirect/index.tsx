import React from 'react';

// components
import { Container, Text, Button } from '../../../components';

export interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // render logic
  return (
    <Container withPadding>
      <Text>¡Genial!</Text>
      <Text>Estamos listos para empezar a vender.</Text>
      <Button title="¡Comencemos!" />
    </Container>
  );
};
