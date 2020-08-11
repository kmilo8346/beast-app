import React, { useRef, useEffect } from 'react';
import { View, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

// components
import {
  Container,
  Text,
  Button,
  ButtonCart,
  InputSelectAddress,
  Toast,
  IToast,
  Icon,
} from '../../components';
// containers
import UserProvider from '../../containers/user';
import OrderProvider from '../../containers/order';
// styles
import colors from '../../styles/colors';

// instances outside component
const prefix = '[home screen]';

export interface Props {
  navigation: any;
}

export default ({ navigation }: Props) => {
  // state
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();
  const orderContainer = OrderProvider.useContainer();
  const purchases = orderContainer.purchases();
  const toastRef = useRef<IToast>(null);

  // preconditions
  if (!user || !user.currentAddress) {
    throw new Error(`${prefix} User must be defined`);
  }

  // event handlers
  const askNotificationPermisions = async (): Promise<void> => {
    if (!Constants.isDevice) {
      return;
    }

    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      console.log('askAsync', status);
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log(finalStatus);
      return;
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };
  useEffect(() => {
    askNotificationPermisions();
  }, []);

  // render logic
  let ordersInProgress = null;
  if (purchases.length) {
    ordersInProgress = (
      <Button
        title={
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Icon name="truck" color={colors.white} />
            <Text
              level={5}
              weight="bold"
              color={colors.white}
              style={{ marginLeft: 10 }}
            >
              Compras en curso
            </Text>
            <View style={{ flex: 1 }} />
            <Text level={5} weight="bold" color={colors.white}>
              {purchases.length}
            </Text>
          </View>
        }
      />
    );
  }
  return (
    <Container safeArea withMargin fakeHeader>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text level={1} weight="bold" style={{ marginBottom: 0 }}>
          Inicio
        </Text>
        <ButtonCart />
      </View>
      <View style={{ height: 40 }} />
      <InputSelectAddress />

      <View style={{ height: 40 }} />
      <Button
        title="Go to PLP"
        onPress={() => {
          navigation.navigate('PLP');
        }}
        style={{ marginTop: 50 }}
      />

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          marginBottom: 10,
        }}
      >
        <Toast ref={toastRef} />
        {ordersInProgress}
      </View>
    </Container>
  );
};
