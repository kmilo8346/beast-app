/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { View } from 'react-native';

// components
import { Container } from '../../components';
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
    <Container>
      <View />
    </Container>
  );
};
