import React from 'react';
import { ScrollView, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';

// components
import { Text, Container, Button } from '../../components';
// local components
import { Item } from './components';
// clients
import userClient from '../../clients/user-client';
// containers
import UserProvider from '../../containers/user';
// styles
import globalStyle from '../../styles';
import styles from './styles';

// instances outside component
const prefix = '[menu screen]';

export interface MenuProps {
  navigation: any;
}

export default ({ navigation }: MenuProps) => {
  // state
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();
  // preconditions
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }

  // event handlers
  const pressToogleSessionHandler = async () => {
    try {
      if (user && user.email) {
        await userClient.signOut();
        // navigation.dispatch(
        //   CommonActions.reset({
        //     index: 1,
        //     routes: [{ name: 'Onboarding' }],
        //   })
        // );
      } else {
        navigation.navigate('SignIn', {
          redirect: {
            name: 'MainTab',
          },
        });
      }
    } catch (error) {
      // TODO: manage error
    }
  };

  const pressMenuItemHandler = (screen: string) => {
    navigation.navigate(screen);
  };

  // render logic
  let toogleSessionMessage = 'Iniciar Session';
  if (user && user.email) {
    toogleSessionMessage = 'Cerrar Session';
  }

  return (
    <Container safeArea fakeHeader>
      <Text level={1} weight="bold" style={globalStyle.withMargin}>
        Menú
      </Text>
      <ScrollView style={globalStyle.withPadding}>
        <View style={styles.space1} />
        <Item
          name="Cuenta"
          description="Correo, email, medios de pagos, dirección"
          onPress={() => pressMenuItemHandler('UpdateAccount')}
        />
        <Item
          name="Compras"
          description="Historial de compras"
          onPress={() => pressMenuItemHandler('Purchases')}
        />
        <Item
          name="Ayuda"
          description="Preguntas frecuentes, tutoriales"
          onPress={() => pressMenuItemHandler('Help')}
        />
      </ScrollView>
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <Button
          title={toogleSessionMessage}
          style={[globalStyle.withMargin, globalStyle.withMainActionAir]}
          onPress={pressToogleSessionHandler}
        />
      </View>
    </Container>
  );
};
