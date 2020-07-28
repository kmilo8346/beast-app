import React, { useRef } from 'react';
import { View } from 'react-native';

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
import OrderProvider from '.././../containers/order';
import colors from '../../styles/colors';

export interface Props {
  navigation: any;
}

export default ({ navigation }: Props) => {
  // state
  const toastRef = useRef<IToast>(null);
  const orderContainer = OrderProvider.useContainer();
  const orders = orderContainer.list(
    (order) =>
      ['confirmation_pending', 'in_delivery'].indexOf(order.status) !== -1
  );
  let ordersInProgress = null;
  if (orders.length) {
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
              {orders.length}
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
      <Button
        title="Show toast"
        onPress={() => {
          const actionId = new Date().getTime();
          toastRef.current?.show({
            message: `Message ${actionId} `,
            action: <Icon name="x" />,
            actionCallback: () => {
              console.log(`Click on action ${actionId}`);
            },
            expiration: 10,
          });
        }}
        style={{ marginTop: 10 }}
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
