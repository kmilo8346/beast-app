import React, { useState } from 'react';
import { View } from 'react-native';
import * as Linking from 'expo-linking'

import { ScreenView, Text, Button, Modal, ActionSheet } from '../../components';
import globalStyle from '../../styles';

// import styles from "./styles";

export interface Props {
  navigation: any
}

export default ({ navigation }: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [fullScreenModalVisible, setFullScreenModalVisible] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  return (
    <ScreenView safeArea withMargin withFakeHeader>
      <Text level={1} weight="bold">Buscar</Text>
      <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
        <Button type="link" title="Open Modal" onPress={() => { setModalVisible(true) }} />
        <Button type="link" title="Open Full Screen Modal" onPress={() => { setFullScreenModalVisible(true) }} />
        <Button title="Contact kmilo :)" onPress={() => { setActionSheetVisible(true) }} />
        <Button title="Go to PLP" onPress={() => { navigation.navigate('PLP') }} />
      </View>
      <Modal type="auto" title="Agrega un dirección" visible={modalVisible} onClose={() => {
        setModalVisible(false)
      }}>
        <View style={globalStyle.withMargin}>
          <Text level={6}>Dirección</Text>
          <Text level={6}>Jose Pedro Alessandri 927</Text>
          <Text level={6}>Departamento</Text>
          <Text level={6}>1009</Text>
          <Button title="Aceptar" />
          <View style={globalStyle.withMainActionAir}></View>
        </View>
      </Modal>
      <Modal type="full" title="Mi Carrito" visible={fullScreenModalVisible} onClose={() => {
        setFullScreenModalVisible(false)
      }}>
        <View>
        </View>
      </Modal>
      <ActionSheet
        options={[
          { key: 'message_whatsapp', text: 'Mensaje +569 64570608', icon: 'whatsapp' },
          { key: 'call_phone', text: 'Llamar +569 64570608', icon: 'phone-call' },
          { key: 'cancel', text: 'Cerrar', icon: 'x', type: 'cancel' }]}
        visible={actionSheetVisible}
        onClose={() => { setActionSheetVisible(false) }}
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
          }
        }}
      />
    </ScreenView >
  );
}


