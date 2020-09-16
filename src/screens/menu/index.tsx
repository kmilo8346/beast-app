import React, {
  useState,
  ReactNode,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import {
  ScrollView,
  View,
  Image,
  GestureResponderEvent,
  Vibration,
} from 'react-native';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

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
import * as utils from '../../lib/utils';
// types
import { LoggedUser, Place } from '../../types';
// cache
import userCache from '../../cache/user';
import ordersInProgressCacheManager from '../../cache/orders-in-progress-cache-manager';
import OrdersInProgressCache, {
  OrdersInProgressCacheData,
} from '../../cache/orders-in-progress-cache';
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
  const [user, setUser] = useState(userCache.getData());
  const [
    ordersInProgressCache,
    setOrdersInProgressCache,
  ] = useState<OrdersInProgressCache | null>(null);
  const [inProgressQty, setInProgressQty] = useState<number | null>(null);
  const [modalManageAddress, setModalManageAddress] = useState(false);
  const [updatingAddressInfo, setUpdatingAddressInfo] = useState(false);
  const [modalHelp, setModalHelp] = useState(false);
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const insets = useSafeAreaInsets();
  const toastRef = useRef<IToast>(null);

  // event handlers
  const instanceOrdersInProgressCache = async (user: string) => {
    const cache = await ordersInProgressCacheManager.get(user);
    setOrdersInProgressCache(cache);
  };

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
    if (inProgressQty && inProgressQty > 0) {
      navigation.navigate('Orders', { view: 'IN_PROGRESS' });
    } else {
      navigation.navigate('Orders', { view: 'HISTORICAL' });
    }
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

  useEffect(() => {
    if (user.id) {
      instanceOrdersInProgressCache(user.id);
    }
  }, [user.id]);

  useFocusEffect(
    useCallback(() => {
      let unsubscribe: () => void = utils.noop;
      if (ordersInProgressCache) {
        unsubscribe = ordersInProgressCache.onChange(
          (data: OrdersInProgressCacheData | undefined) => {
            if (data) {
              setInProgressQty(
                data.orders.reduce((qty, order) => {
                  if (order.customer.id === data.user) {
                    return qty + 1;
                  }
                  return qty;
                }, 0)
              );
            }
          }
        );
      }
      return () => {
        unsubscribe();
      };
    }, [ordersInProgressCache])
  );

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
    let myOrdersText = '';
    if (inProgressQty && inProgressQty > 0) {
      myOrdersText = `Tienes ${inProgressQty} pedidos en curso`;
    }
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
        <Item
          name="Mis pedidos"
          onPress={pressMyOrdersHandler}
          description={myOrdersText}
        />
        <Item name="Ayuda" onPress={pressHelpHandler} />

        <View style={globalStyle.withScreenAir} />
      </ScrollView>
    );
    mainAction = (
      <Button
        title="Cerrar sesión"
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
  let fingerprint: ReactNode | null = null;
  switch (Constants.manifest.extra.BEAST_ENVIRONMENT) {
    case 'development':
      fingerprint = (
        <View
          style={{
            alignItems: 'center',
            marginBottom: 15,
            backgroundColor: colors.white,
          }}
        >
          <Text level={7} style={{ marginBottom: 5 }}>
            Development
          </Text>
          <Text level={7}>{`Usuario ${user.id}`}</Text>
        </View>
      );
      break;
    case 'staging':
      fingerprint = (
        <View
          style={{
            alignItems: 'center',
            marginBottom: 15,
            backgroundColor: colors.white,
          }}
        >
          <Text level={7} style={{ marginBottom: 5 }}>
            Staging
          </Text>
          <Text
            level={7}
            style={{ marginBottom: 5 }}
          >{`Usuario ${user.id}`}</Text>
          <Text
            level={7}
          >{`Commit ${Constants.manifest.extra.GITHUB_SHA}`}</Text>
        </View>
      );
      break;
    case 'production':
      fingerprint = (
        <View
          style={{
            alignItems: 'center',
            marginBottom: 15,
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
          },
          globalStyle.withMargin,
        ]}
      >
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        {fingerprint}
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
