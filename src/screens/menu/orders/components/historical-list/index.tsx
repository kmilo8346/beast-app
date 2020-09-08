import React, { useReducer, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import axios, { CancelTokenSource } from 'axios';

// components
import Loading from '../../../../../components/loading';
import ErrorView from '../../../../../components/error-view';
import Text from '../../../../../components/text';
import DesertImage from '../../../../../components/svgs/images/desert';
// local components
import OrderItem from '../order-item';
// types
import {
  Order,
  SearchResponse,
  OwnerDispatchStatus,
} from '../../../../../types';
// libs
import * as utils from '../../../../../lib/utils';
// clients
import orderClient from '../../../../../clients/order-client';
// cache
import userCache from '../../../../../cache/user';
// styles
import globalStyles from '../../../../../styles';

// instances outside component
const prefix = '[historical list component]';
let fetchRequestSource: CancelTokenSource;
const defaultSize = 10;
type SetErrorAction = {
  type: 'set_error';
  error: Error | null;
};
type SetFetchingMoreAction = {
  type: 'set_fetching_more';
  fetchingMore: boolean;
};
type SetRefreshingAction = {
  type: 'set_refreshing';
  refreshing: boolean;
};
type Action = SetErrorAction | SetFetchingMoreAction | SetRefreshingAction;
type State = {
  error: Error | null;
  fetchingMore: boolean;
  refreshing: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_error':
      return { ...state, error: action.error };
    case 'set_fetching_more':
      return { ...state, fetchingMore: action.fetchingMore };
    case 'set_refreshing':
      return { ...state, refreshing: action.refreshing };
    default:
      return state;
  }
};

export interface InProgressListProps {
  orders?: SearchResponse<Order>;
  onChange?: (orders: SearchResponse<Order>) => void;
  onPressItem?: (order: Order) => void;
}

export default ({
  orders,
  onChange = utils.noop,
  onPressItem = utils.noop,
}: InProgressListProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    error: null,
    fetchingMore: false,
    refreshing: false,
  });
  const user = userCache.getData();
  if (!user) {
    throw new Error(`${prefix} user must be defined`);
  }

  // event handlers
  const fetch = async (from = 0, size = defaultSize) => {
    if (fetchRequestSource) {
      fetchRequestSource.cancel();
    }
    fetchRequestSource = axios.CancelToken.source();
    const response = await orderClient.search(
      {
        filters: {
          customer: user.id,
          status: [
            OwnerDispatchStatus.DELIVERED,
            OwnerDispatchStatus.CANCELLED,
          ],
        },
        from,
        size,
        // TODO: just ask the necesary data
        // source: []
      },
      fetchRequestSource.token
    );
    return response;
  };
  const load = async () => {
    try {
      const response = await fetch();
      // clear error
      dispatch({ type: 'set_error', error: null });
      // send data to parent
      onChange({
        ...response,
        from: response.from + response.hits.length,
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        // TODO: Log error
        console.log(error);

        dispatch({ type: 'set_error', error });
      }
    }
  };
  const fetchMore = async () => {
    // precondition
    if (!orders) {
      // TODO: log
      console.warn(`${prefix} Cant call fetch more with orders undefined`);
      return;
    }
    try {
      dispatch({ type: 'set_fetching_more', fetchingMore: true });
      const response = await fetch(orders.from);
      // clear error
      dispatch({ type: 'set_error', error: null });
      // send data to parent
      onChange({
        ...response,
        from: response.from + response.hits.length,
        hits: [...orders.hits, ...response.hits],
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        // TODO: Log error
        console.log(error);

        dispatch({ type: 'set_error', error });
      }
    } finally {
      dispatch({ type: 'set_fetching_more', fetchingMore: false });
    }
  };
  const refresh = async () => {
    try {
      dispatch({ type: 'set_refreshing', refreshing: true });
      const response = await fetch();
      // clear error
      dispatch({ type: 'set_error', error: null });
      // send data to parent
      onChange({
        ...response,
        from: response.from + response.hits.length,
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        // TODO: Log error
        console.log(error);

        dispatch({ type: 'set_error', error });
      }
    } finally {
      dispatch({ type: 'set_refreshing', refreshing: false });
    }
  };
  const retryHandler = () => {
    if (!orders) {
      load();
    } else {
      fetchMore();
    }
  };
  useEffect(() => {
    if (!orders) {
      load();
    }
  }, [orders]);
  useEffect(() => {
    return () => {
      if (fetchRequestSource) {
        // cancel running request
        fetchRequestSource.cancel();
      }
    };
  }, []);

  // render logic
  if (state.error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ErrorView onRetry={retryHandler} />
      </View>
    );
  }

  if (!orders) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Loading />
      </View>
    );
  }
  return (
    <View
      style={{
        flex: 1,
        paddingTop: 20,
      }}
    >
      <FlatList
        data={orders.hits as Order[]}
        refreshing={state.refreshing}
        keyExtractor={(item: Order) => item.id}
        renderItem={({ item }) => {
          return (
            <OrderItem
              order={item as Order}
              onPress={onPressItem}
              style={{ marginBottom: 5 }}
            />
          );
        }}
        ListFooterComponent={<View style={globalStyles.withScreenAir} />}
        ListEmptyComponent={
          <View
            style={{
              alignItems: 'center',
              marginTop: '40%',
            }}
          >
            <DesertImage />
            <Text level={1} weight="bold" style={{ marginBottom: 10 }}>
              Nada por aquí
            </Text>
          </View>
        }
        onRefresh={refresh}
        onEndReached={() => {
          if (orders.from < orders.total) {
            fetchMore();
          }
        }}
        style={[{ flex: 1 }, globalStyles.withPadding]}
      />
    </View>
  );
};
