import React from 'react';
import { ScrollView, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';

// components
import { Text, Container, Button } from '../../components';
// local components
import { Item } from './components';
// containers
import UserProvider from '../../containers/user';
// styles
import globalStyle from '../../styles';
import styles from './styles';

export interface MenuProps {
  navigation: any;
}

export default ({ navigation }: MenuProps) => {
  // state
  const userContainer = UserProvider.useContainer();
  const user = userContainer.getUser();

  // event handlers
  const pressToogleSessionHandler = async () => {
    try {
      if (user && user.email) {
        await userContainer.signOut();
        //
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: 'Onboarding' }],
          })
        );
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
          onPress={() => null}
        />
        <Item
          name="Compras"
          description="Historial de compras"
          onPress={() => null}
        />
        <Item
          name="Ayuda"
          description="Preguntas frecuentes, tutoriales"
          onPress={() => null}
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
