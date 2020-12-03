import React, { useEffect, useReducer } from 'react';
import {
  ActivityIndicator,
  FlatList,
  GestureResponderEvent,
  View,
} from 'react-native';
import axios, { CancelTokenSource } from 'axios';

// local components
import Skeletton from './components/skeletton';
import SellerOrderItem from './components/seller-order-item';
// components
import Text from '../../components/text';
import ErrorView from '../../components/error-view';
import Button from '../../components/buttons/button';
import DesertImage from '../../components/svgs/images/desert';
// clients
import orderClient from '../../clients/order-client';
// cache
import userCache from '../../cache/user';
// types
import { Order, SearchResponse } from '../../types';
// libs
import { capture } from '../../lib/sentry';
import { eventEmitter } from '../../lib/event-emitter';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[seller orders screen]';
let fetchOrdersRequestSource: CancelTokenSource;

type SetFilterAction = {
  type: 'set_filter';
  filter: string;
};
type ResetAction = {
  type: 'reset';
};
type SetOrdersAction = {
  type: 'set_orders';
  orders: SearchResponse<Order>;
};
type SetErrorAction = {
  type: 'set_error';
  error?: Error;
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
type UpdateOrderAction = {
  type: 'update_order';
  order: Order;
};
type Action =
  | ResetAction
  | SetOrdersAction
  | SetErrorAction
  | SetRefreshingAction
  | SetFetchingMoreAction
  | SetFetchMoreErrorAction
  | UpdateOrderAction;
type State = {
  orders?: SearchResponse<Order>;
  error?: Error;
  refreshing: boolean;
  fetching_more: boolean;
  fetch_more_error?: Error;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'reset':
      return { ...state, orders: undefined, error: undefined };
    case 'set_orders':
      return { ...state, orders: action.orders };
    case 'set_error':
      return { ...state, error: action.error };
    case 'set_refreshing':
      return { ...state, refreshing: action.refreshing };
    case 'set_fetching_more':
      return { ...state, fetching_more: action.fetching_more };
    case 'set_fetch_more_error':
      return { ...state, fetch_more_error: action.fetch_more_error };
    case 'update_order':
      return {
        ...state,
        orders: state.orders
          ? {
              ...state.orders,
              hits: (state.orders?.hits || []).map((order) => {
                if (order.id === action.order.id) {
                  return action.order;
                }
                return order;
              }),
            }
          : state.orders,
      };
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
    refreshing: false,
    fetching_more: false,
  });

  // event handlers
  const fetchOrders = async (from = 0, size = 10) => {
    if (fetchOrdersRequestSource) {
      fetchOrdersRequestSource.cancel();
    }
    fetchOrdersRequestSource = axios.CancelToken.source();
    const response = await orderClient.search(
      {
        filters: {
          store: userCache.getData()?.current_store as string,
        },
        from,
        size,
        sort: { created_at: 'desc' },
      },
      { cancelToken: fetchOrdersRequestSource.token }
    );
    return response;
  };

  const load = async () => {
    try {
      dispatch({ type: 'reset' });
      const response = await fetchOrders();
      dispatch({
        type: 'set_orders',
        orders: {
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
      const response = await fetchOrders();
      dispatch({
        type: 'set_orders',
        orders: {
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
    if (!state.orders) {
      throw new Error(`${prefix} To fetch more must be state orders`);
    }
    try {
      dispatch({ type: 'set_fetch_more_error', fetch_more_error: undefined });
      dispatch({ type: 'set_fetching_more', fetching_more: true });
      const orders = await fetchOrders(state.orders.from, state.orders.size);
      dispatch({
        type: 'set_orders',
        orders: {
          ...orders,
          from: orders.from + orders.hits.length,
          hits: [...state.orders.hits, ...orders.hits],
        },
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

  const retryHandler = () => {
    load();
  };

  const retryFetchMoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    fetchMore();
  };

  useEffect(() => {
    load();

    return () => {
      fetchOrdersRequestSource && fetchOrdersRequestSource.cancel;
    };
  }, []);

  useEffect(() => {
    const removeListener = eventEmitter.on(
      'seller-order.updated',
      (order: Order) => {
        dispatch({ type: 'update_order', order });
      }
    );

    return () => {
      removeListener();
    };
  }, []);

  // render logic
  if (state.error) {
    return (
      <View
        style={{
          backgroundColor: colors.white,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ErrorView onRetry={retryHandler} />
      </View>
    );
  }

  if (!state.orders) {
    return <Skeletton />;
  }

  return (
    <View style={[{ flex: 1, backgroundColor: colors.white }]}>
      <FlatList
        data={state.orders.hits}
        refreshing={state.refreshing}
        keyExtractor={(item: Order) => item.id}
        renderItem={({ item }) => {
          return (
            <SellerOrderItem
              key={item.id}
              data={item}
              navigation={navigation}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', marginTop: 80 }}>
            <DesertImage />
            <Text
              level={5}
              weight="bold"
              style={{ marginTop: 40, marginBottom: 15 }}
            >
              Nada por aquí
            </Text>
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
          if (state.orders && state.orders.from < state.orders.total) {
            fetchMore();
          }
        }}
        style={[{ flex: 1, paddingTop: 10 }, globalStyles.withPadding]}
      />
    </View>
  );
};
