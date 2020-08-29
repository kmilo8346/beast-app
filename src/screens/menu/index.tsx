import React, { useState, ReactNode, useRef } from 'react';
import {
  ScrollView,
  View,
  Image,
  GestureResponderEvent,
  Vibration,
} from 'react-native';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import Text from '../../components/text';
import Button from '../../components/buttons/button';
import BagHeadImage from '../../components/svgs/images/bag-head';
import Toast, { IToast } from '../../components/toast';
// screen components
import ModalManageAddress from '../components/modal-manage-address';
// local components
import Item from './components/item';
import ModalHelp from './components/modal-help';
// clients
import userClient from '../../clients/user-client';
// lib
import firebase from '../../lib/firebase';
// types
import { LoggedUser, Place } from '../../types';
// cache
import userCache from '../../cache/user';
// styles
import globalStyle from '../../styles';
import colors from '../../styles/colors';

// instances outside component
const prefix = '[menu screen]';

export interface MenuProps {
  navigation: any;
}

export default ({ navigation }: MenuProps) => {
  // state
  const [modalManageAddress, setModalManageAddress] = useState(false);
  const [updatingAddressInfo, setUpdatingAddressInfo] = useState(false);
  const [modalHelp, setModalHelp] = useState(false);
  const user = userCache.getData();
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const insets = useSafeAreaInsets();
  const toastRef = useRef<IToast>(null);
  // trick to render on focus
  useIsFocused();

  // event handlers
  const pressMyAddressesHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setModalManageAddress(true);
  };

  const pressPhoneNumberHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('SetPhone', {
      redirect: {
        name: 'Menu',
      },
    });
  };

  const pressMyOrdersHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('Orders', { view: 'HISTORICAL' });
  };

  const pressHelpHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setModalHelp(true);
  };

  const pressCloseSessionHandler = async (event: GestureResponderEvent) => {
    event.stopPropagation();
    await firebase.auth().signOut();
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: 'Boot' }],
      })
    );
  };

  const pressStartSessionHandler = () => {
    navigation.navigate('SignIn', {
      redirect: {
        name: 'MainTab',
      },
      dont_allow_guest: true,
    });
  };

  const addressInfoChangeHandler = async (info: {
    current_address: string;
    addresses: Place[];
  }) => {
    setModalManageAddress(false);

    try {
      setUpdatingAddressInfo(true);
      await userClient.update({
        pathVars: {
          id: user.id,
        },
        body: {
          current_address: info.current_address,
          addresses: info.addresses,
        },
      });
      await userCache.updateData({
        current_address: info.current_address,
        addresses: info.addresses,
      });
    } catch (error) {
      // TODO: log error
      console.log(error);

      Vibration.vibrate(400);
      toastRef.current?.show({
        message: 'No se pudo actualizar las direcciones, reintente',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      setUpdatingAddressInfo(false);
    }
  };

  const closeModalHelpHandler = () => {
    setModalHelp(false);
  };

  // render logic
  const address = userCache.getAddress();
  if (!address) {
    throw new Error(`${prefix} User address mut be defined`);
  }
  let addressText = `${address.route.short_name} ${address.street_number.short_name}`;
  if (address.apartment) {
    addressText = `${addressText} · ${address.apartment}`;
  }

  let content: ReactNode | null = null;
  let mainAction: ReactNode | null = null;
  if (userCache.isLogged()) {
    const user = userCache.getData() as LoggedUser;
    content = (
      <ScrollView
        style={[{ flex: 1, paddingTop: 15 }, globalStyle.withPadding]}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 30,
          }}
        >
          <Image
            source={{
              uri: user.photo_url,
            }}
            style={{ width: 50, height: 50, borderRadius: 100 }}
          />
          <Text
            level={3}
            weight="bold"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ marginLeft: 10 }}
          >{`¡Hola ${user.first_name}!`}</Text>
        </View>

        <Item
          name="Mis direcciones"
          description={addressText}
          processing={updatingAddressInfo}
          onPress={pressMyAddressesHandler}
        />
        <Item
          name="Número de teléfono"
          description={user.phone}
          onPress={pressPhoneNumberHandler}
        />
        <Item name="Mis pedidos" onPress={pressMyOrdersHandler} />
        <Item name="Ayuda" onPress={pressHelpHandler} />

        <View style={globalStyle.withScreenAir} />
      </ScrollView>
    );
    mainAction = (
      <Button
        title="Cerrar sessión"
        style={globalStyle.withMainActionAir}
        onPress={pressCloseSessionHandler}
      />
    );
  } else {
    content = (
      <ScrollView
        style={[{ flex: 1, paddingTop: 15 }, globalStyle.withPadding]}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
          }}
        >
          <BagHeadImage />
          <Text
            level={3}
            weight="bold"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ marginLeft: 10 }}
          >
            ¡Hola invitado!
          </Text>
        </View>

        <Text level={6} style={{ marginBottom: 10, lineHeight: 20 }}>
          Crea una cuenta para poder realizar compras y ofrecerte una mejor
          experiencia.
        </Text>

        <Item
          name="Mis direcciones"
          description={addressText}
          processing={updatingAddressInfo}
          onPress={pressMyAddressesHandler}
        />
        <Item name="Ayuda" onPress={pressHelpHandler} />

        <View style={globalStyle.withScreenAir} />
      </ScrollView>
    );
    mainAction = (
      <Button
        title="Iniciar sessión"
        style={globalStyle.withMainActionAir}
        onPress={pressStartSessionHandler}
      />
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.white,
        paddingTop: insets.top,
      }}
    >
      <Text
        level={2}
        weight="bold"
        style={[{ marginBottom: 5 }, globalStyle.withMargin]}
      >
        Más opciones
      </Text>

      {content}

      <View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingBottom: insets.bottom,
          },
          globalStyle.withMargin,
        ]}
      >
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        {mainAction}
      </View>

      {modalManageAddress && (
        <ModalManageAddress
          value={{
            current_address: user.current_address,
            addresses: user.addresses,
          }}
          onChange={addressInfoChangeHandler}
        />
      )}

      {modalHelp && <ModalHelp onClose={closeModalHelpHandler} />}
    </View>
  );
};
