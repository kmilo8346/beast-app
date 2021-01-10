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
  AsyncStorage,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import axios, { CancelTokenSource } from 'axios';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

// local components
import Search from './components/search';
import Skeleton from './components/skeleton';
import ProductCard from './components/product-card';
import SelectAddress from './components/select-address';
import OnboardingModal from './components/onboarding-modal';
import InProgressNotifications from './components/in-progress-notifications';
// screen components
import ModalManageAddress from '../components/modal-manage-address';
import ShoppingCartIcon from '../components/shopping-cart-icon';
import ConfirmDialog from '../components/dialogs/confirm-dialog';
// components
import Text from '../../components/text';
import Divider from '../../components/divider';
import Button from '../../components/buttons/button';
import Toast, { IToast } from '../../components/toast';
import BannerImage from '../../components/svgs/images/banner';
import BasketCatImage from '../../components/svgs/images/basket-cat';
import SleepingCatImage from '../../components/svgs/images/sleeping-cat';
// clients
import userClient from '../../clients/user-client';
import storeProductClient from '../../clients/store-product-client';
// libs
import { capture } from '../../lib/sentry';
import deviceAgent from '../../lib/device-agent';
// cache
import userCache from '../../cache/user';
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
  StoreProduct,
} from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

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
type ResetAction = {
  type: 'reset';
};
type SetProductsAction = {
  type: 'set_products';
  products: SearchResponse<StoreProduct>;
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
type SetNewSaleDialogAction = {
  type: 'set_new_sale_dialog';
  new_sale_dialog: string;
};
type SetOnboardingModalAction = {
  type: 'set_onboarding_modal';
  onboarding_modal: boolean;
};
type Action =
  | SetUserAction
  | SetUpdatingAction
  | ResetAction
  | SetProductsAction
  | SetErrorAction
  | SetRefreshingAction
  | SetFetchingMoreAction
  | SetFetchMoreErrorAction
  | SetPendingSellerOrdersAction
  | SetAddressModalAction
  | SetPendingAddressInfoAction
  | SetNewSaleDialogAction
  | SetOnboardingModalAction;
type State = {
  user?: User;
  updating: boolean;
  products?: SearchResponse<StoreProduct>;
  error?: Error;
  refreshing: boolean;
  fetching_more: boolean;
  fetch_more_error?: Error;
  pending_seller_orders?: number;
  address_modal: boolean;
  pending_address_info?: AddressInfo;
  new_sale_dialog: string;
  onboarding_modal: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_user':
      return { ...state, user: action.user };
    case 'set_updating':
      return { ...state, updating: action.updating };
    case 'reset':
      return { ...state, products: undefined, error: undefined };
    case 'set_products':
      return { ...state, products: action.products };
    case 'set_error':
      return { ...state, error: action.error };
    case 'set_refreshing':
      return { ...state, refreshing: action.refreshing };
    case 'set_fetching_more':
      return { ...state, fetching_more: action.fetching_more };
    case 'set_fetch_more_error':
      return { ...state, fetch_more_error: action.fetch_more_error };
    case 'set_pending_seller_orders':
      return { ...state, pending_seller_orders: action.pending_seller_orders };
    case 'set_address_modal':
      return { ...state, address_modal: action.address_modal };
    case 'set_pending_address_info':
      return { ...state, pending_address_info: action.pending_address_info };
    case 'set_new_sale_dialog':
      return { ...state, new_sale_dialog: action.new_sale_dialog };
    case 'set_onboarding_modal':
      return { ...state, onboarding_modal: action.onboarding_modal };
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
    new_sale_dialog: '',
    onboarding_modal: false,
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
    filters?: { [key: string]: any },
    from = 0,
    size = defaultSize
  ) => {
    if (fetchRequestSource) {
      fetchRequestSource.cancel();
    }
    fetchRequestSource = axios.CancelToken.source();
    const response = await storeProductClient.search(
      {
        filters,
        from,
        size,
        sort: {
          updated_at: 'desc',
        },
        source: [
          'id',
          'name',
          'price',
          'store',
          'enabled',
          'reference',
          'description',
          'tags',
          'images',
          'created_at',
          'updated_at',
          'store_info.name',
          'store_info.images',
        ],
      },
      { cancelToken: fetchRequestSource.token }
    );
    return response;
  };

  const load = async () => {
    try {
      dispatch({ type: 'reset' });
      const response = await fetch({
        enabled: true,
        location: (address as Place).location,
        store_enabled: true,
      });
      dispatch({
        type: 'set_products',
        products: {
          ...response,
          from: response.from + response.hits.length,
        },
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
      const response = await fetch({
        enabled: true,
        location: (address as Place).location,
        store_enabled: true,
      });
      dispatch({
        type: 'set_products',
        products: {
          ...response,
          from: response.from + response.hits.length,
        },
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
    if (!state.products) {
      throw new Error(`${prefix} To fetch more must be state products`);
    }
    try {
      dispatch({ type: 'set_fetch_more_error', fetch_more_error: undefined });
      dispatch({ type: 'set_fetching_more', fetching_more: true });
      const products = await fetch(
        state.products.filters,
        state.products.from,
        state.products.size
      );
      dispatch({
        type: 'set_products',
        products: {
          ...products,
          from: products.from + products.hits.length,
          hits: [...state.products.hits, ...products.hits],
        },
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Fetch more error', error);

        dispatch({ type: 'set_fetch_more_error', fetch_more_error: error });
      } else {
        console.log('fetch more is cancelled');
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
      }
      // sync user id to device
      if (state.user?.id) {
        deviceAgent.sync({ user_id: state.user.id });
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

  const showOnBoarding = async () => {
    try {
      const raw: string | null = await AsyncStorage.getItem(
        `@cache/${Constants.manifest.extra.BEAST_ENVIRONMENT}/onboarding`
      );

      const onboarding = raw ? JSON.parse(raw) : undefined;
      if (!onboarding) {
        setTimeout(() => {
          dispatch({ type: 'set_onboarding_modal', onboarding_modal: true });
        }, 300);
      }
    } catch (error) {
      capture(prefix, 'Show onboarding error', error);
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

  const pressSeeStoresHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('Stores');
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

  const pressProductCardHandler = useCallback((product: StoreProduct) => {
    navigation.navigate('Product', { product });
  }, []);

  const newSaleDialogOkHandler = () => {
    const order = state.new_sale_dialog;
    dispatch({
      type: 'set_new_sale_dialog',
      new_sale_dialog: '',
    });
    navigation.navigate('SellerOrderDetails', { order });
  };

  const newSaleDialogCancelHandler = () => {
    dispatch({
      type: 'set_new_sale_dialog',
      new_sale_dialog: '',
    });
  };

  const onBoardingModalCloseHandler = async () => {
    dispatch({ type: 'set_onboarding_modal', onboarding_modal: false });
    try {
      await AsyncStorage.setItem(
        `@cache/${Constants.manifest.extra.BEAST_ENVIRONMENT}/onboarding`,
        JSON.stringify(true)
      );
    } catch (error) {
      capture(prefix, 'On boarding modal close handler error', error);
    }
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

  useFocusEffect(
    useCallback(() => {
      showOnBoarding();
    }, [])
  );

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
          No se pudo cargar los productos
        </Text>
        <Text level={6} style={{ marginBottom: 10, textAlign: 'center' }}>
          Pero no te desanimes, reintentalo una vez más
        </Text>
        <Button title="Reintentar" type="link" onPress={retryHandler} />
      </View>
    );
  } else if (!state.products) {
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
        data={state.products.hits}
        numColumns={2}
        refreshing={state.refreshing}
        ListHeaderComponent={() => {
          if (!state.products?.hits.length) {
            return null;
          }
          return (
            <View>
              <BannerImage />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 15,
                  marginBottom: 15,
                }}
              >
                <Text
                  level={4}
                  weight="bold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ flex: 1 }}
                >
                  Productos para ti
                </Text>
                <Button
                  type="link"
                  title={
                    <Text level={6} weight="bold" color={colors.blue}>
                      Ver tiendas
                    </Text>
                  }
                  style={{ paddingRight: 0 }}
                  onPress={pressSeeStoresHandler}
                />
              </View>
            </View>
          );
        }}
        keyExtractor={(item: StoreProduct) => item.id}
        renderItem={({ item, index }) => {
          return (
            <ProductCard
              key={`${item.id}`}
              product={item}
              align={index % 2 === 0 ? 'left' : 'right'}
              onPress={pressProductCardHandler}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
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
            state.products &&
            !state.fetching_more &&
            state.products.from < state.products.total
          ) {
            fetchMore();
          }
        }}
        style={[{ flex: 1, paddingTop: 15 }, globalStyles.withPadding]}
      />
    );
  }

  // data
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.white, paddingTop: insets.top }}
    >
      <View style={globalStyles.withMargin}>
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
          <Search navigation={navigation} />
        </View>
        {selectAddressComponent}
      </View>

      <Divider type="thick" style={{ marginTop: 5 }} />

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
      {!!state.new_sale_dialog && (
        <ConfirmDialog
          title="¡Tienes una nueva orden!"
          message="Uno de tus clientes acaba de realizar una orden. No lo hagas esperar."
          okText="Ver orden"
          cancelText="Más tarde"
          onOk={newSaleDialogOkHandler}
          onCancel={newSaleDialogCancelHandler}
        />
      )}
      {state.onboarding_modal && (
        <OnboardingModal onClose={onBoardingModalCloseHandler} />
      )}
    </View>
  );
};
