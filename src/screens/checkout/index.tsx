import React from 'react';

// components
import { Container, InputSelectCard } from '../../components';
// libs
import useSecureScreen from '../../lib/hooks/use-secure-screen';

export interface CheckoutProps {
  navigation: any;
  route: any;
}

export default ({ navigation }: CheckoutProps) => {
  useSecureScreen(navigation, {
    name: 'Checkout',
  });

  return (
    <Container withMargin>
      <InputSelectCard />
    </Container>
  );
};
