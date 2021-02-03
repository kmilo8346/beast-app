import React, { useLayoutEffect, useReducer } from 'react';
import {
  View,
  FlatList,
  GestureResponderEvent,
  ActivityIndicator,
} from 'react-native';
import axios, { CancelTokenSource } from 'axios';

// local components
import Item from './components/item';
// components
import Text from '../../components/text';
import Button from '../../components/buttons/button';
// clients
import storeProductClient from '../../clients/store-product-client';
// libs
import { capture } from '../../lib/sentry';
// types
import { SearchResponse, StoreProduct } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[stores screen]';
let fetchRequestSource: CancelTokenSource;

type SetProductsAction = {
  type: 'set_products';
  products: SearchResponse<StoreProduct>;
};
type AddProductsAction = {
  type: 'add_products';
  products: SearchResponse<StoreProduct>;
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
type Action =
  | SetProductsAction
  | AddProductsAction
  | SetRefreshingAction
  | SetFetchingMoreAction
  | SetFetchMoreErrorAction;
type State = {
  products: SearchResponse<StoreProduct>;
  error?: Error;
  refreshing: boolean;
  fetching_more: boolean;
  fetch_more_error?: Error;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_products':
      return {
        ...state,
        products: {
          ...action.products,
          from: action.products.from + action.products.hits.length,
        },
      };
    case 'add_products':
      return {
        ...state,
        products: {
          ...action.products,
          from: action.products.from + action.products.hits.length,
          hits: [...(state.products?.hits || []), ...action.products.hits],
        },
      };
    case 'set_refreshing':
      return { ...state, refreshing: action.refreshing };
    case 'set_fetching_more':
      return {
        ...state,
        fetching_more: action.fetching_more,
        fetch_more_error: action.fetching_more
          ? undefined
          : state.fetch_more_error,
      };
    case 'set_fetch_more_error':
      return { ...state, fetch_more_error: action.fetch_more_error };
    default:
      return state;
  }
};

interface ScreenProps {
  route: any;
  navigation: any;
}

export default ({ route, navigation }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    products: {
      ...route.params.response,
      from: route.params.response.from + route.params.response.hits.length,
    },
    refreshing: false,
    fetching_more: false,
  });

  // event handlers
  const fetch = async (from: number, size: number) => {
    fetchRequestSource && fetchRequestSource.cancel();
    fetchRequestSource = axios.CancelToken.source();

    const response = await storeProductClient.search(
      {
        from,
        size,
        sort: state.products.sort,
        source: state.products.source,
        filters: state.products.filters,
        collapse: state.products.collapse,
      },
      { cancelToken: fetchRequestSource.token }
    );
    return response;
  };

  const refresh = async () => {
    try {
      dispatch({ type: 'set_refreshing', refreshing: true });
      const response = await fetch(0, 10);
      dispatch({
        type: 'set_products',
        products: response,
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
      dispatch({ type: 'set_fetching_more', fetching_more: true });
      const response = await fetch(state.products.from, state.products.size);
      dispatch({
        type: 'add_products',
        products: response,
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

  const retryFetchMoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    fetchMore();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.title,
    });
  }, [route.params.title]);

  // render logic
  return (
    <FlatList
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
            <ActivityIndicator color={colors.black} style={{ marginTop: 20 }} />
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
      data={state.products.hits}
      renderItem={({ item }) => {
        return <Item key={item.id} navigation={navigation} data={item} />;
      }}
      refreshing={state.refreshing}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item: StoreProduct) => item.id}
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
      style={{ flex: 1, backgroundColor: colors.white }}
    />
  );
};
