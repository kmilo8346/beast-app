import React, {
  useReducer,
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';
import { View, GestureResponderEvent, FlatList } from 'react-native';
import axios, { CancelTokenSource } from 'axios';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';

// components
import ErrorView from '../../../components/error-view';
import Loading, { MessageTypes } from '../../../components/loading';
import Text from '../../../components/text';
import Button from '../../../components/buttons/button';
import AddCircleBlueIcon from '../../../components/svgs/icons/add-circle-blue';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../../components/loading-overlay';
import Toast, { IToast } from '../../../components/toast';
import Icon from '../../../components/icon';
// local components
import StoreItem from './components/store-item';
// seller components
import Shortcut from '../components/shortcut';
// clients
import storeClient from '../../../clients/store-client';
import userClient from '../../../clients/user-client';
// libs
import { v4 as uuidv4 } from '../../../lib/uuid';
import * as utils from '../../../lib/utils';
import { capture } from '../../../lib/sentry';
// cache
import userCache from '../../../cache/user';
import storeCache from '../../../cache/store';
import OrdersInProgressCache, {
  OrdersInProgressCacheData,
} from '../../../cache/orders-in-progress-cache';
import ordersInProgressCacheManager from '../../../cache/orders-in-progress-cache-manager';
// types
import {
  PaymentProvider,
  DispatchProvider,
  SearchResponse,
  Store,
  LoggedUser,
} from '../../../types';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[select or create store screen]';
const defaultSize = 10;
let fetchRequestSource: CancelTokenSource;
interface StoresOrdersInProgress {
  [key: string]: number;
}

type SetUserAction = {
  type: 'set_user';
  user: LoggedUser;
};
type SetOrdersInProgressCacheAction = {
  type: 'set_orders_in_progress_cache';
  cache: OrdersInProgressCache;
};
type SetStoresOrdersInProgressAction = {
  type: 'set_stores_orders_in_progress';
  stores_orders_in_progress: StoresOrdersInProgress;
};
type SetStoresAction = {
  type: 'set_stores';
  stores: SearchResponse<Store>;
};
type SetErrorAction = {
  type: 'set_error';
  error: Error;
};
type SetFetchingMoreAction = {
  type: 'set_fetching_more';
  fetching_more: boolean;
};
type Action =
  | SetUserAction
  | SetOrdersInProgressCacheAction
  | SetStoresOrdersInProgressAction
  | SetStoresAction
  | SetErrorAction
  | SetFetchingMoreAction;
type State = {
  user: LoggedUser;
  orders_in_progress_cache?: OrdersInProgressCache;
  stores_orders_in_progress?: StoresOrdersInProgress;
  stores?: SearchResponse<Store>;
  error?: Error;
  fetching_more: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_user':
      return {
        ...state,
        user: action.user,
      };
    case 'set_orders_in_progress_cache':
      return { ...state, orders_in_progress_cache: action.cache };
    case 'set_stores_orders_in_progress':
      return {
        ...state,
        stores_orders_in_progress: action.stores_orders_in_progress,
      };
    case 'set_stores':
      return {
        ...state,
        error: undefined,
        stores: action.stores,
      };
    case 'set_error':
      return {
        ...state,
        error: action.error,
      };
    case 'set_fetching_more':
      return {
        ...state,
        fetching_more: action.fetching_more,
      };
    default:
      return state;
  }
};

interface SelectStoreProps {
  navigation: any;
}

export default ({ navigation }: SelectStoreProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    user: userCache.getData() as LoggedUser,
    fetching_more: false,
  });
  if (!state.user) {
    throw new Error(`${prefix} user must be defined`);
  }
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);
  const toastRef = useRef<IToast>(null);

  // event handlers
  const instanceOrdersInProgressCache = async (user: string) => {
    const cache = await ordersInProgressCacheManager.get(user);
    dispatch({ type: 'set_orders_in_progress_cache', cache });
  };

  const fetch = async (from = 0, size = defaultSize) => {
    if (fetchRequestSource) {
      fetchRequestSource.cancel();
    }
    fetchRequestSource = axios.CancelToken.source();
    const stores = await storeClient.search(
      {
        filters: {
          user: state.user.id,
        },
        from,
        size,
      },
      fetchRequestSource.token
    );
    return stores;
  };

  const load = async () => {
    try {
      const stores = await fetch();
      dispatch({
        type: 'set_stores',
        stores: {
          ...stores,
          from: stores.from + stores.hits.length,
        },
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Load error', error);

        dispatch({ type: 'set_error', error });
      }
    }
  };

  const fetchMore = async () => {
    // precondition
    if (!state.stores) {
      console.warn(`${prefix} Cant call fetch more with stores undefined`);
      return;
    }
    try {
      dispatch({ type: 'set_fetching_more', fetching_more: true });
      const stores = await fetch(state.stores.from);
      dispatch({
        type: 'set_stores',
        stores: {
          ...stores,
          from: stores.from + stores.hits.length,
          hits: [...state.stores.hits, ...stores.hits],
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

  const retryHandler = () => {
    if (!state.stores) {
      load();
    } else {
      fetchMore();
    }
  };

  const createStoreHandler = async () => {
    storeCache.replaceData({
      user: state.user.id,
      phone: state.user.phone as string,
      reference: `${`${state.user.id}`.substring(0, 6)}-${uuidv4()}`,
      payment_provider: PaymentProvider.MERCADOPAGO,
      dispatch_provider: DispatchProvider.OWNER,
    });
    navigation.navigate('SetStoreInfo');
  };

  const pressItemHandler = async (store: Store) => {
    try {
      loadingOverlayRef.current?.show();
      await userClient.update({
        pathVars: { id: state.user.id },
        body: {
          current_store: store.id,
        },
      });
      storeCache.setData(store);
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: 'SellerDashboard' }],
        })
      );
    } catch (error) {
      capture(prefix, 'Press item handler error', error);

      toastRef.current?.show({
        message: 'Ocurrió un error, reintenta por favor',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  const pressSeeComisionsHandler = () => {
    WebBrowser.openBrowserAsync(
      'https://www.mercadopago.cl/ayuda/costo-recibir-pagos-dinero_220'
    );
  };

  useEffect(() => {
    load();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = userCache.onChange((user) => {
        dispatch({ type: 'set_user', user: user as LoggedUser });
      });
      return () => {
        unsubscribe();
      };
    }, [])
  );

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
                type: 'set_stores_orders_in_progress',
                stores_orders_in_progress: data.orders.reduce<{
                  [key: string]: number;
                }>((hash, order) => {
                  const result = { ...hash };
                  result[order.transaction.store.id] =
                    hash[order.transaction.store.id] || 0;
                  result[order.transaction.store.id]++;
                  return result;
                }, {}),
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: state.stores?.hits.length !== 0,
    });
  }, [state.stores?.hits]);

  // render logic
  if (state.error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.white,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ErrorView onRetry={retryHandler} />
      </View>
    );
  }

  if (!state.stores) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.white,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Loading message_type={MessageTypes.SELLER} />
      </View>
    );
  }

  if (!state.stores.hits.length) {
    return (
      <View
        style={[
          {
            flex: 1,
            backgroundColor: colors.blue,
            justifyContent: 'center',
            alignItems: 'center',
          },
          globalStyles.withPadding,
        ]}
      >
        <View>
          <Text
            level={1}
            weight="bold"
            style={{ color: colors.white, marginBottom: 25 }}
          >
            ¡Vende con nosotros!
          </Text>

          <Text level={5} style={{ color: colors.white, marginBottom: 15 }}>
            <Text level={5} weight="bold" color={colors.white}>
              *{` `}
            </Text>
            Shop Shop nunca cobrará por tus ventas.
          </Text>
          <Text level={5} style={{ color: colors.white, marginBottom: 15 }}>
            <Text level={5} weight="bold" color={colors.white}>
              *{` `}
            </Text>
            Despacha{' '}
            <Text level={5} weight="bold" color={colors.white}>
              gratis
            </Text>{' '}
            a tus vecinos.
          </Text>
          <Text level={5} style={{ color: colors.white, marginBottom: 15 }}>
            <Text level={5} weight="bold" color={colors.white}>
              *{` `}
            </Text>
            Llega a más clientes con multiples medios de pago.
          </Text>
          <Text level={5} style={{ color: colors.white, marginBottom: 15 }}>
            <Text level={5} weight="bold" color={colors.white}>
              *{` `}
            </Text>
            No tienes que ser empresa para vender.
          </Text>
          <Text level={5} style={{ color: colors.white }}>
            <Text level={5} weight="bold" color={colors.white}>
              *{` `}
            </Text>
            Mercado Pago te cobrará una{' '}
            <Text
              level={5}
              weight="bold"
              style={{
                color: colors.white,
                alignItems: 'center',
              }}
              onPress={pressSeeComisionsHandler}
            >
              comisión bien baja.{` `}
              <Icon name="external-link" size={16} color={colors.white} />
            </Text>
          </Text>
        </View>
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
          <Button
            type="secondary"
            title="Crear tienda"
            onPress={(event: GestureResponderEvent) => {
              event.stopPropagation();
              createStoreHandler();
            }}
            style={[globalStyles.withMainActionAir, globalStyles.withMargin]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <Text
        level={5}
        style={[{ marginTop: 5, marginBottom: 20 }, globalStyles.withPadding]}
      >
        Seleccione tienda
      </Text>
      <FlatList
        data={state.stores.hits}
        keyExtractor={(store: Store) => store.id}
        renderItem={({ item }) => {
          let progress: number | undefined;
          if (state.stores_orders_in_progress) {
            progress = state.stores_orders_in_progress[item.id];
          }
          return (
            <StoreItem
              data={item}
              progress={progress}
              onPress={pressItemHandler}
            />
          );
        }}
        ListFooterComponent={<View style={globalStyles.withScreenAir} />}
        onEndReached={() => {
          if (state.stores && state.stores.from < state.stores.total) {
            fetchMore();
          }
        }}
        style={[{ flex: 1 }, globalStyles.withPadding]}
      />
      <View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
          globalStyles.withMargin,
        ]}
      >
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Shortcut
          image={<AddCircleBlueIcon />}
          title="Agregar tienda"
          onPress={createStoreHandler}
          style={globalStyles.withMainActionAir}
        />
      </View>

      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
