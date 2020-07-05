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
      <Text>Set store delivery info</Text>
      <Button title="Go to mercado pago link" onPress={() => {}} />
    </Container>
  );
};
