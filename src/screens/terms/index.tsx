import React from 'react';
import { View } from 'react-native';

// components
import { Container, Text, Button } from '../../components';

export interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  const redirect = route.params.redirect;
  // event handlers
  const pressContinueHandler = () => {
    navigation.navigate(redirect.name, redirect.params);
  };
  return (
    <Container safeArea withMargin>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text level={5} style={{ lineHeight: 30 }}>
            Al continuar, aceptas los Términos de uso y la Política de
            privacidad de Shop-Shop
          </Text>
        </View>
      </View>
      <Button title="Continuar" onPress={pressContinueHandler} />
    </Container>
  );
};
