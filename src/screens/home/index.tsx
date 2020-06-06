import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import * as Linking from 'expo-linking'

import { ScreenView, Text, Button, Modal, ActionSheet, ModalManageAddress } from '../../components';
import User, { Address } from '../../containers/user';

export interface Props {
  navigation: any
}

export default ({ navigation }: Props) => {
  const user = User.useContainer();

  const [fullScreenModalVisible, setFullScreenModalVisible] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [modalManageAddressVisible, setModalManageAddressVisible] = useState(false);

  let fullScreenModal = null;
  if (fullScreenModalVisible) {
    fullScreenModal = (
      <Modal type="full" title="Mi Carrito" onRequestClose={() => {
        setFullScreenModalVisible(false)
      }}>
        <View style={{ height: 200 }}>
        </View>
      </Modal>
    )
  }

  let actionSheet = null;
  if (actionSheetVisible) {
    actionSheet = (
      <ActionSheet
        options={[
          { key: 'message_whatsapp', text: 'Mensaje +569 64570608', icon: 'whatsapp' },
          { key: 'call_phone', text: 'Llamar +569 64570608', icon: 'phone-call' },
          { key: 'cancel', text: 'Cerrar', icon: 'x', type: 'cancel' }]}
        onRequestClose={() => {
          setActionSheetVisible(false)
        }}
        onCallAction={async (key) => {
          try {
            switch (key) {
              case 'call_phone':
                await Linking.openURL('tel:+56964570608');

                break;
              case 'message_whatsapp':
                Linking.openURL(
                  'https://wa.me/+56964570608'
                );
                break;

              default:
                break;
            }
          } catch (error) {
            console.error(error)
          } finally {
            setActionSheetVisible(false)
          }
        }}
      />
    )
  }

  let modalManageAddress = null;
  if (modalManageAddressVisible) {
    modalManageAddress = (
      <ModalManageAddress onRequestClose={() => {
        setModalManageAddressVisible(false)
      }} />
    )
  }

  return (
    <ScreenView safeArea withMargin withFakeHeader>
      <Text level={1} weight="bold">Buscar</Text>
      <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
        <Text color="red">{JSON.stringify(user.getAddresses())}</Text>
        <Button type="link" title="Open Full Screen Modal" onPress={() => { setFullScreenModalVisible(true) }} />
        <Button type="link" title="Open Address Modal" onPress={() => { setModalManageAddressVisible(true) }} />
        <Button title="Contact kmilo :)" onPress={() => { setActionSheetVisible(true) }} />
        <Button title="Go to PLP" onPress={() => { navigation.navigate('PLP') }} />
      </View>
      {fullScreenModal}
      {actionSheet}
      {modalManageAddress}
    </ScreenView >
  );
}


