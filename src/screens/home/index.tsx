import React, { useState } from 'react';
import { View } from 'react-native';
import * as Linking from 'expo-linking';

import {
  Container,
  Text,
  Button,
  ActionSheet,
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
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [modalManageAddressVisible, setModalManageAddressVisible] = useState(
    false
  );

  let actionSheet = null;
  if (actionSheetVisible) {
    actionSheet = (
      <ActionSheet
        options={[
          {
            key: 'message_whatsapp',
            text: 'Mensaje +569 64570608',
            icon: 'whatsapp',
          },
          {
            key: 'call_phone',
            text: 'Llamar +569 64570608',
            icon: 'phone-call',
          },
          { key: 'cancel', text: 'Cerrar', icon: 'x', type: 'cancel' },
        ]}
        onRequestClose={() => {
          setActionSheetVisible(false);
        }}
        onCallAction={async (key) => {
          try {
            switch (key) {
              case 'call_phone':
                await Linking.openURL('tel:+56964570608');

                break;
              case 'message_whatsapp':
                Linking.openURL('https://wa.me/+56964570608');
                break;

              default:
                break;
            }
          } catch (error) {
            //
          } finally {
            setActionSheetVisible(false);
          }
        }}
      />
    );
  }

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
          title="Contact kmilo :)"
          onPress={() => {
            setActionSheetVisible(true);
          }}
          style={{ marginBottom: 5 }}
        />
        <Button
          title="Go to PLP"
          onPress={() => {
            navigation.navigate('PLP');
          }}
        />
      </View>
      {actionSheet}
      {modalManageAddress}
      <ButtonCart />
    </Container>
  );
};
