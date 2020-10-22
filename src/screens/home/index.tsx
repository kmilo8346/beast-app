import React, {
  useReducer,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { View, FlatList, GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import axios, { CancelTokenSource } from 'axios';

// components
import Text from '../../components/text';
import Toast, { IToast } from '../../components/toast';
import Divider from '../../components/divider';
import Touchable from '../../components/touchable';
import BagWhiteIcon from '../../components/svgs/icons/bag-white';
import Button from '../../components/buttons/button';
import BasketCatImage from '../../components/svgs/images/basket-cat';
import SleepingCatImage from '../../components/svgs/images/sleeping-cat';
import FreeDeliveryImage from '../../components/svgs/images/free-delivery';
// screen components
import ModalManageAddress from '../components/modal-manage-address';
import ShoppingCartIcon from '../components/shopping-cart-icon';
import ConfirmDialog from '../components/dialogs/confirm-dialog';
// local components
import SelectAddress from './components/select-address';
import Skeleton from './components/skeleton';
import ProductCard from './components/product-card';
// clients
import userClient from '../../clients/user-client';
import productClient from '../../clients/product-client';
// libs
import * as utils from '../../lib/utils';
import { capture } from '../../lib/sentry';
// cache
import userCache from '../../cache/user';
import ordersInProgressCacheManager from '../../cache/orders-in-progress-cache-manager';
import OrdersInProgressCache, {
  OrdersInProgressCacheData,
} from '../../cache/orders-in-progress-cache';
import shoppingCartCache from '../../cache/shopping-cart';
// types
import {
  LoggedUser,
  User,
  AddressInfo,
  Place,
  SearchResponse,
  Product,
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
  user: User;
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
  products: SearchResponse<Product>;
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
type SetOrdersInProgressCacheAction = {
  type: 'set_orders_in_progress_cache';
  cache: OrdersInProgressCache;
};
type SetInProgressQtyAction = {
  type: 'set_in_progress_qty';
  qty: number;
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
  | ResetAction
  | SetProductsAction
  | SetErrorAction
  | SetRefreshingAction
  | SetFetchingMoreAction
  | SetOrdersInProgressCacheAction
  | SetInProgressQtyAction
  | SetAddressModalAction
  | SetPendingAddressInfoAction;
type State = {
  user: User;
  updating: boolean;
  products?: SearchResponse<Product>;
  error?: Error;
  refreshing: boolean;
  fetching_more: boolean;
  orders_in_progress_cache?: OrdersInProgressCache;
  in_progress_qty?: number;
  address_modal: boolean;
  pending_address_info?: AddressInfo;
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
    case 'set_orders_in_progress_cache':
      return { ...state, orders_in_progress_cache: action.cache };
    case 'set_in_progress_qty':
      return { ...state, in_progress_qty: action.qty };
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
    user: userCache.getData() as User,
    updating: false,
    refreshing: false,
    fetching_more: false,
    address_modal: false,
  });
  if (!state.user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const address = userCache.getAddress();
  const insets = useSafeAreaInsets();
  const toastRef = useRef<IToast>(null);
  let addressInfo;
  if (state.user.current_address && state.user.addresses?.length) {
    addressInfo = {
      current_address: state.user.current_address,
      addresses: state.user.addresses,
    };
  }

  // event handlers
  const instanceOrdersInProgressCache = async (user: string) => {
    const cache = await ordersInProgressCacheManager.get(user);
    dispatch({ type: 'set_orders_in_progress_cache', cache });
  };

  const fetch = async (
    filters?: { [key: string]: any },
    from = 0,
    size = defaultSize
  ) => {
    if (fetchRequestSource) {
      fetchRequestSource.cancel();
    }
    fetchRequestSource = axios.CancelToken.source();
    const response = await productClient.search(
      {
        pathVars: {
          storeId: 'all',
        },
        filters,
        from,
        size,
      },
      fetchRequestSource.token
    );
    return response;
  };

  const load = async () => {
    try {
      dispatch({ type: 'reset' });
      const response = await fetch({
        enabled: true,
        location: (address as Place).geometry.location,
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
        location: (address as Place).geometry.location,
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

        dispatch({ type: 'set_error', error });
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

        dispatch({ type: 'set_error', error });
      }
    } finally {
      dispatch({ type: 'set_fetching_more', fetching_more: false });
    }
  };

  const updateAddressInfo = async (info: AddressInfo) => {
    try {
      const prev_current_address = state.user.current_address;
      dispatch({ type: 'set_updating', updating: true });
      await userClient.update({
        pathVars: {
          id: state.user.id,
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
      state.user.current_address !== info.current_address &&
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

  const pressInProgressButtonHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('Orders', { view: 'IN_PROGRESS' });
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
    if (state.products) {
      load();
    } else {
      fetchMore();
    }
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

  const pressProductCardHandler = (product: Product) => {
    navigation.navigate('Product', { product });
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = userCache.onChange((user) => {
        dispatch({ type: 'set_user', user: user as User });
      });
      return () => {
        unsubscribe();
      };
    }, [])
  );

  useEffect(() => {
    if (state.user.current_address && state.user.addresses?.length) {
      load();
    }
  }, [state.user.current_address, state.user.addresses]);

  useEffect(() => {
    if (state.user.id) {
      instanceOrdersInProgressCache(state.user.id);
    }
  }, [state.user.id]);

  useFocusEffect(
    useCallback(() => {
      let unsubscribe: () => void = utils.noop;
      if (state.orders_in_progress_cache) {
        unsubscribe = state.orders_in_progress_cache.onChange(
          (data: OrdersInProgressCacheData | undefined) => {
            if (data) {
              dispatch({
                type: 'set_in_progress_qty',
                qty: data.orders.reduce((qty, order) => {
                  if (order.customer.id === data.user) {
                    return qty + 1;
                  }
                  return qty;
                }, 0),
              });
            }
          }
        );
      }
      return () => {
        unsubscribe();
      };
    }, [state.orders_in_progress_cache])
  );

  // render logic
  let message = '¡Hola!';
  if (userCache.isLogged()) {
    const logged = state.user as LoggedUser;
    message = `¡Hola ${logged.first_name}!`;
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
  let inProgressComponent: ReactNode = null;
  if (state.in_progress_qty && state.in_progress_qty > 0) {
    inProgressComponent = (
      <Touchable
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.blue,
          paddingLeft: 30,
          paddingVertical: 7,
        }}
        onPress={pressInProgressButtonHandler}
      >
        <BagWhiteIcon />
        <Text
          level={6}
          weight="bold"
          color={colors.white}
          style={{ marginLeft: 10 }}
        >{`Tienes ${state.in_progress_qty} pedidos en curso`}</Text>
      </Touchable>
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
          style={{ marginTop: 25, marginBottom: 10 }}
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
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text level={6} weight="bold" style={{ marginBottom: 15 }}>
          Ocurrió un error inesperado
        </Text>
        <Text level={6} style={{ marginBottom: 10 }}>
          El error fue registrado para su solución
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
  } else if (!state.products?.hits.length) {
    content = (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
    );
  } else {
    content = (
      <FlatList
        data={state.products.hits}
        numColumns={2}
        refreshing={state.refreshing}
        ListHeaderComponent={
          <View>
            <FreeDeliveryImage />
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
        }
        keyExtractor={(item: Product) => item.id}
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
        ListFooterComponent={<View style={globalStyles.withScreenAir} />}
        onRefresh={refresh}
        onEndReached={() => {
          if (state.products && state.products.from < state.products.total) {
            fetchMore();
          }
        }}
        style={[{ flex: 1, marginTop: 15 }, globalStyles.withPadding]}
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
        </View>
        {selectAddressComponent}
      </View>

      <Divider type="thick" style={{ marginTop: 5 }} />

      {content}

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <Toast
          ref={toastRef}
          containerStyle={[{ marginBottom: 10 }, globalStyles.withMargin]}
        />
        {inProgressComponent}
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
