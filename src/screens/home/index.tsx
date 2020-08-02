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
// local components
import ButtonPay from './button-pay';
// containers
import OrderProvider from '../../containers/order';
import colors from '../../styles/colors';

export interface Props {
  navigation: any;
}

export default ({ navigation }: Props) => {
  // state
  const toastRef = useRef<IToast>(null);
  const orderContainer = OrderProvider.useContainer();
  const purchases = orderContainer.purchases();
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
      <View style={{ height: 20 }} />
      <ButtonPay />

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
