import React from 'react';
import { View } from 'react-native';

// components
import { Container, Text, Button } from '../../components';
// styles
import globalStyles from '../../styles';

export interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  // event handlers
  const pressContinueHandler = () => {
    const { redirect } = route.params;
    if (redirect.name === 'SignIn') {
      navigation.navigate('SignIn', {
        redirect: {
          name: 'MainTab',
        },
      });
      return;
    }
    if (redirect.name === 'SetAddress') {
      navigation.navigate('SetAddress');
      return;
    }
    throw new Error(
      `Redirect name (${route.params.redirect.name}) not supported`
    );
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
      <Button
        title="Continuar"
        onPress={pressContinueHandler}
        style={globalStyles.withMainActionAir}
      />
    </Container>
  );
};
