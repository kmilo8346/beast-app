import React, {
  useReducer,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import {
  View,
  FlatList,
  GestureResponderEvent,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import axios, { CancelTokenSource } from 'axios';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

// local components
import Widget from './components/widget';
import Skeleton from './components/skeleton';
import SelectAddress from './components/select-address';
import InProgressNotifications from './components/in-progress-notifications';
// screen components
import ModalManageAddress from '../components/modal-manage-address';
import ShoppingCartIcon from '../components/shopping-cart-icon';
import ConfirmDialog from '../components/dialogs/confirm-dialog';
// components
import Text from '../../components/text';
import Icon from '../../components/icon';
import Touchable from '../../components/touchable';
import Button from '../../components/buttons/button';
import Toast, { IToast } from '../../components/toast';
import BasketCatImage from '../../components/svgs/images/basket-cat';
import SleepingCatImage from '../../components/svgs/images/sleeping-cat';
// clients
import userClient from '../../clients/user-client';
import widgetClient from '../../clients/widget-client';
// libs
import { capture } from '../../lib/sentry';
// cache
import userCache from '../../cache/user';
import genericCache from '../../cache/generic';
import shoppingCartCache from '../../cache/shopping-cart';
import pendingSellerOrdersCache, {
  getTotal,
} from '../../cache/pending-seller-orders-cache';
// types
import {
  User,
  AddressInfo,
  Place,
  SearchResponse,
  RenderedWidget,
} from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';
import deviceClient, { getDeviceData } from '../../clients/device-client';

// instances outside component
const prefix = '[home screen]';
let fetchRequestSource: CancelTokenSource;
const defaultSize = 10;

type SetUserAction = {
  type: 'set_user';
  user?: User;
};
type SetUpdatingAction = {
  type: 'set_updating';
  updating: boolean;
};
type SetWidgetsAction = {
  type: 'set_widgets';
  widgets: SearchResponse<RenderedWidget>;
};
type AddWidgetsAction = {
  type: 'add_widgets';
  widgets: SearchResponse<RenderedWidget>;
};
type ResetWidgetsAction = {
  type: 'reset_widgets';
};
type SetErrorAction = {
  type: 'set_error';
  error: Error;
};
type SetRefreshingAction = {
  type: 'set_refreshing';
  refreshing: boolean;
};
type SetFetchingMoreAction = {
  type: 'set_fetching_more';
  fetching_more: boolean;
};
type SetFetchMoreErrorAction = {
  type: 'set_fetch_more_error';
  fetch_more_error?: Error;
};
type SetPendingSellerOrdersAction = {
  type: 'set_pending_seller_orders';
  pending_seller_orders: number;
};
type SetAddressModalAction = {
  type: 'set_address_modal';
  address_modal: boolean;
};
type SetPendingAddressInfoAction = {
  type: 'set_pending_address_info';
  pending_address_info?: AddressInfo;
};
type Action =
  | SetUserAction
  | SetUpdatingAction
  | SetWidgetsAction
  | AddWidgetsAction
  | ResetWidgetsAction
  | SetErrorAction
  | SetRefreshingAction
  | SetFetchingMoreAction
  | SetFetchMoreErrorAction
  | SetPendingSellerOrdersAction
  | SetAddressModalAction
  | SetPendingAddressInfoAction;
type State = {
  user?: User;
  updating: boolean;
  widgets?: SearchResponse<RenderedWidget>;
  error?: Error;
  refreshing: boolean;
  fetching_more: boolean;
  fetch_more_error?: Error;
  pending_seller_orders?: number;
  address_modal: boolean;
  pending_address_info?: AddressInfo;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_user':
      return { ...state, user: action.user };
    case 'set_updating':
      return { ...state, updating: action.updating };
    case 'set_widgets':
      return {
        ...state,
        widgets: {
          ...action.widgets,
          from: action.widgets.from + action.widgets.hits.length,
        },
      };
    case 'add_widgets':
      return {
        ...state,
        widgets: {
          ...action.widgets,
          from: action.widgets.from + action.widgets.hits.length,
          hits: [...(state.widgets?.hits || []), ...action.widgets.hits],
        },
      };
    case 'reset_widgets':
      return {
        ...state,
        widgets: undefined,
        error: undefined,
      };
    case 'set_error':
      return { ...state, error: action.error };
    case 'set_refreshing':
      return { ...state, refreshing: action.refreshing };
    case 'set_fetching_more':
      return {
        ...state,
        fetching_more: action.fetching_more,
        fetch_more_error: undefined,
      };
    case 'set_fetch_more_error':
      return { ...state, fetch_more_error: action.fetch_more_error };
    case 'set_pending_seller_orders':
      return { ...state, pending_seller_orders: action.pending_seller_orders };
    case 'set_address_modal':
      return { ...state, address_modal: action.address_modal };
    case 'set_pending_address_info':
      return { ...state, pending_address_info: action.pending_address_info };
    default:
      return state;
  }
};

interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    user: userCache.getData(),
    updating: false,
    refreshing: false,
    fetching_more: false,
    address_modal: false,
  });
  const address = userCache.getAddress();
  const insets = useSafeAreaInsets();
  const toastRef = useRef<IToast>(null);
  let addressInfo;
  if (state.user?.current_address && state.user.addresses?.length) {
    addressInfo = {
      current_address: state.user.current_address,
      addresses: state.user.addresses,
    };
  }

  // event handlers
  const fetch = async (
    filters: { [key: string]: any },
    context: { [key: string]: any },
    from = 0,
    size = defaultSize
  ) => {
    if (fetchRequestSource) {
      fetchRequestSource.cancel();
    }
    fetchRequestSource = axios.CancelToken.source();
    const response = await widgetClient.render(
      {
        filters,
        context,
        sort: {
          order: 'asc',
        },
        from,
        size,
      },
      { cancelToken: fetchRequestSource.token }
    );
    return response;
  };

  const load = async () => {
    try {
      dispatch({ type: 'reset_widgets' });
      const response = await fetch(
        {
          tags: ['default'],
        },
        {
          location: (address as Place).location,
          store_address: (address as Place).id,
        }
      );
      dispatch({
        type: 'set_widgets',
        widgets: response,
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Load error', error);

        dispatch({ type: 'set_error', error });
      }
    }
  };

  const refresh = async () => {
    try {
      dispatch({ type: 'set_refreshing', refreshing: true });
      const response = await fetch(
        {
          tags: ['default'],
        },
        {
          location: (address as Place).location,
          store_address: (address as Place).id,
        }
      );
      dispatch({
        type: 'set_widgets',
        widgets: response,
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Refresh error', error);
      }
    } finally {
      dispatch({ type: 'set_refreshing', refreshing: false });
    }
  };

  const fetchMore = async () => {
    if (!state.widgets) {
      throw new Error(`${prefix} To fetch more must be state widgets`);
    }
    try {
      dispatch({ type: 'set_fetching_more', fetching_more: true });
      const response = await fetch(
        {
          tags: ['default'],
        },
        {
          location: (address as Place).location,
          store_address: (address as Place).id,
        },
        state.widgets.from,
        state.widgets.size
      );
      dispatch({
        type: 'add_widgets',
        widgets: response,
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Fetch more error', error);

        dispatch({ type: 'set_fetch_more_error', fetch_more_error: error });
      }
    } finally {
      dispatch({ type: 'set_fetching_more', fetching_more: false });
    }
  };

  const requestNotificationPermisions = async () => {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      console.log(
        `${prefix} Notification permision current status, status ${existingStatus}`
      );
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        console.log(
          `${prefix} Notification permision status after request the user, status ${status}`
        );
      } else if (genericCache.getDeviceId()) {
        try {
          const data = await getDeviceData();
          await deviceClient.updateOrCreate({
            pathVars: { id: genericCache.getDeviceId() },
            body: data,
            source: ['id'],
          });
        } catch (error) {
          capture(
            prefix,
            'Request notification permisions, update device error',
            error
          );
        }
      }
    }
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: colors.red,
        sound: 'default',
      });
    }
  };

  const updateAddressInfo = async (info: AddressInfo) => {
    try {
      const prev_current_address = state.user?.current_address;
      dispatch({ type: 'set_updating', updating: true });
      if (state.user?.id) {
        await userClient.update({
          pathVars: {
            id: state.user.id,
          },
          body: {
            current_address: info.current_address,
            addresses: info.addresses,
          },
          source: ['updated_at'],
        });
      }
      await userCache.updateData({
        current_address: info.current_address,
        addresses: info.addresses,
      });
      if (prev_current_address !== info.current_address) {
        shoppingCartCache.clear();
      }
    } catch (error) {
      capture(prefix, 'Change address info handler error', error);

      toastRef.current?.show({
        message: 'Ocurrió un error, reintente por favor',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      dispatch({ type: 'set_updating', updating: false });
    }
  };

  const changeAddressInfoHandler = async (info: AddressInfo) => {
    if (
      state.user?.current_address !== info.current_address &&
      !shoppingCartCache.isEmpty()
    ) {
      dispatch({
        type: 'set_pending_address_info',
        pending_address_info: info,
      });
    } else {
      updateAddressInfo(info);
    }
  };

  const pressAddAddressHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_address_modal', address_modal: true });
  };

  const addressModalChangeHandler = (info?: AddressInfo) => {
    if (info) {
      changeAddressInfoHandler(info);
    }

    dispatch({ type: 'set_address_modal', address_modal: false });
  };

  const pressCreateStoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('SellerStack');
  };

  const retryHandler = () => {
    load();
  };

  const retryFetchMoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    fetchMore();
  };

  const confirmDialogOkHandler = () => {
    const info = { ...(state.pending_address_info as AddressInfo) };
    dispatch({
      type: 'set_pending_address_info',
      pending_address_info: undefined,
    });
    updateAddressInfo(info);
  };

  const confirmDialogCancelHandler = () => {
    dispatch({
      type: 'set_pending_address_info',
      pending_address_info: undefined,
    });
  };

  const pressSearchIconHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('Search');
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = userCache.onChange((user) => {
        dispatch({ type: 'set_user', user });
      });
      return () => {
        unsubscribe();
      };
    }, [])
  );

  useEffect(() => {
    if (state.user?.current_address && state.user?.addresses?.length) {
      Promise.all([load(), requestNotificationPermisions()]);
    }
  }, [state.user?.current_address, state.user?.addresses]);

  useEffect(() => {
    const unsubscribe = pendingSellerOrdersCache.onChange((data: any) => {
      dispatch({
        type: 'set_pending_seller_orders',
        pending_seller_orders: getTotal(data),
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const notificationResponseReceivedListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data || {};
        if (data.beast_require_store && !state.user?.current_store) {
          return;
        }

        if (data.beast_route) {
          setTimeout(() => {
            navigation.navigate(data.beast_route, data.beast_params);
          }, 300);
        }
      }
    );
    return () => {
      Notifications.removeNotificationSubscription(
        notificationResponseReceivedListener
      );
    };
  }, []);

  // render logic
  let message = '¡Hola!';
  if (state.user?.first_name) {
    message = `¡Hola ${state.user.first_name}!`;
  }
  let selectAddressComponent: ReactNode = null;
  if (addressInfo) {
    selectAddressComponent = (
      <SelectAddress
        value={addressInfo as AddressInfo}
        processing={state.updating}
        onChange={changeAddressInfoHandler}
      />
    );
  }

  let content: ReactNode = null;
  // not current address
  if (!address) {
    content = (
      <View
        style={[
          {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <BasketCatImage />
        <Text
          level={4}
          weight="bold"
          style={{ marginTop: 25, marginBottom: 10, textAlign: 'center' }}
        >
          ¿Donde quieres recibir tu pedido?
        </Text>
        <Text
          level={5}
          weight="light"
          style={{
            lineHeight: 23,
            textAlign: 'center',
            marginHorizontal: 20,
            marginBottom: 40,
          }}
        >
          Para comenzar, agrega una dirección donde quieres recibir tus pedidos.
        </Text>
        <Button
          title="Elegir dirección"
          type="link"
          loading={state.updating}
          onPress={pressAddAddressHandler}
        />
      </View>
    );
  } else if (state.error) {
    content = (
      <View
        style={[
          {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          },
          globalStyles.withMargin,
        ]}
      >
        <Text level={6} weight="bold" style={{ marginBottom: 15 }}>
          No se pudo cargar la información
        </Text>
        <Text level={6} style={{ marginBottom: 10, textAlign: 'center' }}>
          Pero no te desanimes, reintentalo una vez más
        </Text>
        <Button title="Reintentar" type="link" onPress={retryHandler} />
      </View>
    );
  } else if (!state.widgets) {
    content = (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.white,
        }}
      >
        <Skeleton />
      </View>
    );
  } else {
    content = (
      <FlatList
        data={state.widgets.hits}
        refreshing={state.refreshing}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: RenderedWidget) => item.id}
        renderItem={({ item }) => {
          return (
            <Widget key={`${item.id}`} navigation={navigation} widget={item} />
          );
        }}
        ListHeaderComponent={
          <View style={[globalStyles.withMargin, { marginBottom: 7 }]}>
            <View style={globalStyles.screenWithoutHeaderSpace} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 3,
              }}
            >
              <Text
                level={2}
                weight="bold"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ flex: 1 }}
              >
                {message}
              </Text>

              <ShoppingCartIcon />
              <Touchable
                style={{ paddingVertical: 5, paddingLeft: 15, paddingRight: 5 }}
                onPress={pressSearchIconHandler}
              >
                <Icon name="search" size={20} />
              </Touchable>
            </View>
            {selectAddressComponent}
          </View>
        }
        ListEmptyComponent={
          <View
            style={{
              marginTop: 50,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <SleepingCatImage />
            <Text
              level={6}
              style={{
                marginTop: 20,
                marginBottom: 20,
                textAlign: 'center',
                width: 320,
              }}
            >
              En este momento no hay tiendas{' '}
              <Text level={6} weight="bold">
                {' '}
                abiertas
              </Text>{' '}
              en tu zona.
            </Text>
            <Text
              level={5}
              weight="bold"
              style={{ marginBottom: 40, textAlign: 'center' }}
            >
              ¡Inténtalo de nuevo más tarde!
            </Text>
            <Button
              title="¡O, crea tu tienda hoy!"
              type="link"
              onPress={pressCreateStoreHandler}
            />
          </View>
        }
        ListFooterComponent={
          <View
            style={[
              {
                alignItems: 'center',
                height: 60,
              },
              globalStyles.withScreenAir,
            ]}
          >
            {state.fetching_more && (
              <ActivityIndicator
                color={colors.black}
                style={{ marginTop: 20 }}
              />
            )}
            {!!state.fetch_more_error && (
              <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <Text level={6}>No se pudo cargar más.</Text>
                <Button
                  title={
                    <Text level={6} color={colors.blue} weight="bold">
                      Reintentar
                    </Text>
                  }
                  type="link"
                  style={{ paddingHorizontal: 5 }}
                  onPress={retryFetchMoreHandler}
                />
              </View>
            )}
          </View>
        }
        onRefresh={refresh}
        onEndReached={() => {
          if (
            !state.fetching_more &&
            state.widgets &&
            state.widgets.from < state.widgets.total
          ) {
            fetchMore();
          }
        }}
        style={[{ flex: 1, paddingTop: 0 }]}
      />
    );
  }

  // data
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.white, paddingTop: insets.top }}
    >
      {content}

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <Toast
          ref={toastRef}
          containerStyle={[{ marginBottom: 10 }, globalStyles.withMargin]}
        />
        <InProgressNotifications navigation={navigation} />
      </View>
      {state.address_modal && (
        <ModalManageAddress
          value={addressInfo}
          onChange={addressModalChangeHandler}
        />
      )}
      {state.pending_address_info && (
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
