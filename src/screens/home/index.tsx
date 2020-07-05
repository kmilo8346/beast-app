import React, { useRef } from 'react';
import { View } from 'react-native';

// components
import {
  Container,
  Text,
  Button,
  ButtonCart,
  InputSelectAddress,
  InputSelectDeliveryTime,
  Toast,
  IToast,
  Icon,
} from '../../components';

export interface Props {
  navigation: any;
}

export default ({ navigation }: Props) => {
  // state
  const toastRef = useRef<IToast>(null);

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
      <InputSelectDeliveryTime />
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
      </View>
    </Container>
  );
};
