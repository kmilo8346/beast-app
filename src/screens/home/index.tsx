import React, { useState } from 'react';
import { View } from 'react-native';

import {
  Container,
  Text,
  Button,
  ModalManageAddress,
  ButtonCart,
} from '../../components';
import User from '../../containers/user';

export interface Props {
  navigation: any;
}

export default ({ navigation }: Props) => {
  const userContainer = User.useContainer();
  const user = userContainer.getUser();
  const [modalManageAddressVisible, setModalManageAddressVisible] = useState(
    false
  );

  let modalManageAddress = null;
  if (modalManageAddressVisible) {
    modalManageAddress = (
      <ModalManageAddress
        currentAddress={user.currentAddress}
        addresses={user.addresses}
        onSave={(currentAddress, addresses) => {
          userContainer.setCurrentAddress(currentAddress);
          userContainer.setAddresses(addresses);
          setModalManageAddressVisible(false);
        }}
        onRequestClose={() => {
          setModalManageAddressVisible(false);
        }}
      />
    );
  }

  return (
    <Container safeArea withMargin fakeHeader>
      <Text level={1} weight="bold">
        Buscar
      </Text>
      <View style={{ flex: 1 }}>
        <Button
          type="link"
          title="Open Address Modal"
          onPress={() => {
            setModalManageAddressVisible(true);
          }}
        />
        <Button
          title="Go to PLP"
          onPress={() => {
            navigation.navigate('PLP');
          }}
        />
      </View>
      {modalManageAddress}
      <ButtonCart />
    </Container>
  );
};
