import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import Text from '../../components/text';
import Button from '../../components/buttons/button';
// local components
import Item from './components/item';
// lib
import firebase from '../../lib/firebase';
// cache
import userCache from '../../cache/user';
// styles
import globalStyle from '../../styles';
import colors from '../../styles/colors';
import styles from './styles';

// instances outside component
const prefix = '[menu screen]';

function useForceUpdate() {
  const [, setValue] = useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

export interface MenuProps {
  navigation: any;
}

export default ({ navigation }: MenuProps) => {
  // state
  useIsFocused();
  const user = userCache.getData();
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const insets = useSafeAreaInsets();

  // event handlers
  const pressToogleSessionHandler = async () => {
    try {
      if (userCache.isLogged()) {
        await firebase.auth().signOut();
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: 'Boot' }],
          })
        );
      } else {
        navigation.navigate('SignIn', {
          redirect: {
            name: 'MainTab',
          },
          dont_allow_guest: true,
        });
      }
    } catch (error) {
      // TODO: log error
      console.log(error);
    }
  };

  const pressMenuItemHandler = (screen: string) => {
    switch (screen) {
      case 'Orders':
        navigation.navigate('Orders', { view: 'HISTORICAL' });
        break;

      default:
        navigation.navigate(screen);
        break;
    }
  };

  // useFocusEffect(() => {
  //   console.log('calling force update');
  //   forceUpdate();
  // });

  // render logic
  let toogleSessionMessage = 'Iniciar Session';
  if (userCache.isLogged()) {
    toogleSessionMessage = 'Cerrar Session';
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.white, paddingTop: insets.top }}
    >
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
          name="Mis Pedidos"
          description="En curso, historial de pedidos"
          onPress={() => pressMenuItemHandler('Orders')}
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
    </View>
  );
};
