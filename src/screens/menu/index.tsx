import React, { useState, ReactNode, useRef, useCallback } from 'react';
import {
  ScrollView,
  View,
  Image,
  GestureResponderEvent,
  Vibration,
  Share,
  AsyncStorage,
} from 'react-native';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

// components
import Text from '../../components/text';
import Button from '../../components/buttons/button';
import BagHeadImage from '../../components/svgs/images/bag-head';
import Toast, { IToast } from '../../components/toast';
// screen components
import ModalManageAddress from '../components/modal-manage-address';
import ConfirmDialog from '../components/dialogs/confirm-dialog';
// local components
import Item from './components/item';
import ModalHelp from './components/modal-help';
// clients
import userClient from '../../clients/user-client';
// lib
import { capture } from '../../lib/sentry';
import * as utils from '../../lib/utils';
import cloudinary from '../../lib/cloudinary';
// types
import { AddressInfo } from '../../types';
// cache
import userCache from '../../cache/user';
import shoppingCartCache from '../../cache/shopping-cart';
// styles
import globalStyles from '../../styles';
import colors from '../../styles/colors';

// instances outside component
const prefix = '[menu screen]';

interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const [user, setUser] = useState(userCache.getData());
  const [modalManageAddress, setModalManageAddress] = useState(false);
  const [updatingAddressInfo, setUpdatingAddressInfo] = useState(false);
  const [modalHelp, setModalHelp] = useState(false);
  const [pendingAddressInfo, setPendingAddressInfo] = useState<
    AddressInfo | undefined
  >();
  const insets = useSafeAreaInsets();
  const toastRef = useRef<IToast>(null);
  let addressInfo;
  if (user?.current_address && user.addresses?.length) {
    addressInfo = {
      current_address: user.current_address,
      addresses: user.addresses,
    };
  }

  // event handlers
  const updateAddressInfo = async (info: AddressInfo) => {
    try {
      const prev_current_address = userCache.getData()?.current_address;
      setUpdatingAddressInfo(true);
      if (user?.id) {
        await userClient.update({
          pathVars: {
            id: user.id,
          },
          body: {
            current_address: info.current_address,
            addresses: info.addresses,
          },
        });
      }
      await userCache.updateData({
        current_address: info.current_address,
        addresses: info.addresses,
      });
      if (prev_current_address !== info.current_address) {
        shoppingCartCache.clear();
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: 'MainTab' }],
          })
        );
      }
    } catch (error) {
      capture(prefix, 'Update address info error', error);

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

  const pressMyAddressesHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setModalManageAddress(true);
  };

  const pressMyOrdersHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('ClientOrders');
  };

  const pressCloseSessionHandler = async (event: GestureResponderEvent) => {
    event.stopPropagation();
    shoppingCartCache.clear();
    userCache.resetData();
    try {
      await AsyncStorage.setItem(
        `@cache/${Constants.manifest.extra.BEAST_ENVIRONMENT}/onboarding`,
        JSON.stringify(false)
      );
    } catch (error) {
      capture(prefix, 'Unsetting onboarding error', error);
    }
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: 'MainTab' }],
      })
    );
  };

  const pressStartSessionHandler = () => {
    navigation.navigate('SetPhone', { redirect: { name: 'Menu' } });
  };

  const pressShareHandler = async () => {
    try {
      await Share.share({
        message: `Te invito a usar Shop Shop, la app para comprar y vender entre vecinos y más. Descárgala aqui:\n${Constants.manifest.extra.BEAST_WEB_URL}`,
      });
    } catch (error) {
      capture(prefix, 'Press share handler error', error);
    }
  };

  const addressInfoChangeHandler = (info?: AddressInfo) => {
    setModalManageAddress(false);
    if (!info) {
      return;
    }
    if (
      userCache.getData()?.current_address !== info.current_address &&
      !shoppingCartCache.isEmpty()
    ) {
      setPendingAddressInfo(info);
    } else {
      updateAddressInfo(info);
    }
  };

  const closeModalHelpHandler = () => {
    setModalHelp(false);
  };

  const confirmDialogOkHandler = () => {
    const info = { ...(pendingAddressInfo as AddressInfo) };
    setPendingAddressInfo(undefined);
    updateAddressInfo(info);
  };

  const confirmDialogCancelHandler = () => {
    setPendingAddressInfo(undefined);
  };

  const pressMyAccountHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('EditUserData');
  };

  const pressTermsHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    WebBrowser.openBrowserAsync(
      `${Constants.manifest.extra.BEAST_WEB_URL}/policies`
    );
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = userCache.onChange((user) => {
        setUser(user);
      });
      return () => {
        unsubscribe();
      };
    }, [])
  );

  // render logic
  const address = userCache.getAddress();
  let addressText = 'Administra tus direcciones';
  let photoComponent: ReactNode = <BagHeadImage />;
  let firstNameComponent: ReactNode = (
    <Text
      level={3}
      weight="bold"
      numberOfLines={1}
      ellipsizeMode="tail"
      style={{ marginLeft: 10, flex: 1, flexWrap: 'wrap' }}
    >
      ¡Hola!
    </Text>
  );
  let mainAction: ReactNode = null;
  let fingerprint: ReactNode = null;
  if (address) {
    addressText = utils.formatPlace(address);
  }
  if (user?.photo_url) {
    photoComponent = (
      <Image
        source={{
          uri: cloudinary.dynamicUrl(user.photo_url, 'w_100'),
          ,
        }}
        style={{ width: 50, height: 50, borderRadius: 100 }}
      />
    );
  }
  if (user?.first_name) {
    firstNameComponent = (
      <Text
        level={3}
        weight="bold"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{ marginLeft: 10, flex: 1, flexWrap: 'wrap' }}
      >{`¡Hola ${user.first_name}!`}</Text>
    );
  }
  if (!user?.phone || !user.phone_verified) {
    mainAction = (
      <Button
        title="Iniciar sesión"
        style={globalStyles.withMainActionAir}
        onPress={pressStartSessionHandler}
      />
    );
  }
  switch (Constants.manifest.extra.BEAST_ENVIRONMENT) {
    case 'development':
      fingerprint = (
        <View
          style={{
            alignItems: 'center',
            paddingBottom: 10,
            backgroundColor: colors.white,
          }}
        >
          <Text level={7} style={{ marginBottom: 5 }}>
            Development
          </Text>
          {!!user?.id && (
            <Text
              level={7}
              numberOfLines={1}
              ellipsizeMode="tail"
            >{`Usuario ${user.id}`}</Text>
          )}
        </View>
      );
      break;
    case 'staging':
      fingerprint = (
        <View
          style={{
            alignItems: 'center',
            paddingBottom: 10,
            backgroundColor: colors.white,
          }}
        >
          <Text level={7} style={{ marginBottom: 5 }}>
            Staging
          </Text>
          {!!user?.id && (
            <Text
              level={7}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ marginBottom: 5 }}
            >{`Usuario ${user.id}`}</Text>
          )}
          <Text
            level={7}
            numberOfLines={1}
            ellipsizeMode="tail"
          >{`Commit ${Constants.manifest.extra.GITHUB_SHA}`}</Text>
        </View>
      );
      break;
    case 'production':
      fingerprint = (
        <View
          style={{
            alignItems: 'center',
            paddingBottom: 10,
            backgroundColor: colors.white,
          }}
        >
          <Text
            level={7}
            style={{ marginBottom: 5 }}
          >{`Versión ${Constants.nativeAppVersion} (${Constants.nativeBuildVersion})`}</Text>
          <Text level={7}>
            Creado con ❤ por{' '}
            <Text level={7} weight="bold">
              firedevs
            </Text>
          </Text>
        </View>
      );
      break;

    default:
      break;
  }
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.white,
        paddingTop: insets.top,
      }}
    >
      <View style={globalStyles.screenWithoutHeaderSpace} />
      <Text
        level={2}
        weight="bold"
        style={[{ marginBottom: 5 }, globalStyles.withMargin]}
      >
        Más opciones
      </Text>
      <ScrollView
        style={[{ flex: 1, paddingTop: 15 }, globalStyles.withPadding]}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
          }}
        >
          {photoComponent}
          {firstNameComponent}
        </View>

        {!!user?.id && (
          <Item
            name="Mi cuenta"
            description="Edita datos de tu cuenta"
            onPress={pressMyAccountHandler}
          />
        )}
        {!!user?.id && (
          <Item
            name="Mis pedidos"
            onPress={pressMyOrdersHandler}
            description="Histórico de pedidos"
          />
        )}
        <Item
          name="Mis direcciones"
          description={addressText}
          processing={updatingAddressInfo}
          onPress={pressMyAddressesHandler}
        />
        <Item
          name="Compartir app"
          description="Comparte con amigos y clientes"
          onPress={pressShareHandler}
        />
        <Item
          name="Términos y condiciones"
          description="Revisa los términos y condiciones"
          onPress={pressTermsHandler}
        />

        {user?.phone && user.phone_verified && (
          <Button
            title="Cerrar sesión"
            type="link"
            style={{ alignSelf: 'center', marginTop: 20 }}
            onPress={pressCloseSessionHandler}
          />
        )}

        <View style={globalStyles.withScreenAir} />
      </ScrollView>
      <View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.white,
          },
          globalStyles.withMargin,
        ]}
      >
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        {fingerprint}
        {mainAction}
      </View>

      {modalManageAddress && (
        <ModalManageAddress
          value={addressInfo}
          onChange={addressInfoChangeHandler}
        />
      )}

      {modalHelp && <ModalHelp onClose={closeModalHelpHandler} />}
      {pendingAddressInfo && (
        <ConfirmDialog
          title="¿Seguro que quieres cambiar dirección?"
          message="Tienes artículos en tu carrito que se perderán al cambiar la dirección de entrega."
          okText="Si, cambiar"
          onOk={confirmDialogOkHandler}
          onCancel={confirmDialogCancelHandler}
        />
      )}
    </View>
  );
};
