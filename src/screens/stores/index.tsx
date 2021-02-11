import React, { ReactNode, useEffect, useReducer } from 'react';
import {
  View,
  FlatList,
  GestureResponderEvent,
  ActivityIndicator,
} from 'react-native';
import axios, { CancelTokenSource } from 'axios';

// local components
import Item from './components/item';
import Skeleton from './components/skeleton';
// components
import Text from '../../components/text';
import Button from '../../components/buttons/button';
import BasketCatImage from '../../components/svgs/images/basket-cat';
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

type ResetProductsAction = {
  type: 'reset_products';
};
type SetProductsAction = {
  type: 'set_products';
  products: SearchResponse<StoreProduct>;
};
type AddProductsAction = {
  type: 'add_products';
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
type Action =
  | ResetProductsAction
  | SetProductsAction
  | AddProductsAction
  | SetErrorAction
  | SetRefreshingAction
  | SetFetchingMoreAction
  | SetFetchMoreErrorAction;
type State = {
  products?: SearchResponse<StoreProduct>;
  error?: Error;
  refreshing: boolean;
  fetching_more: boolean;
  fetch_more_error?: Error;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'reset_products':
      return {
        ...state,
        products: undefined,
        error: undefined,
      };
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
    case 'set_error':
      return { ...state, error: action.error };
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
        sort: route.params.sort,
        source: route.params.source,
        filters: route.params.filters,
        collapse: route.params.collapse,
      },
      { cancelToken: fetchRequestSource.token }
    );
    return response;
  };

  const load = async () => {
    try {
      dispatch({ type: 'reset_products' });
      const response = await fetch(0, 10);
      dispatch({
        type: 'set_products',
        products: response,
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

  const retryHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    load();
  };

  const retryFetchMoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    fetchMore();
  };

  useEffect(() => {
    load();

    return () => {
      fetchRequestSource && fetchRequestSource.cancel();
    };
  }, []);

  // render logic
  let content: ReactNode = (
    <View style={{ flex: 1 }}>
      <Skeleton />
    </View>
  );
  if (state.error) {
    content = (
      <View
        style={[
          { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  } else if (state.products) {
    content = (
      <FlatList
        ListHeaderComponent={
          <View style={[globalStyles.withMargin, { marginBottom: 15 }]}>
            <Text
              level={4}
              weight="bold"
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{ flex: 1 }}
            >
              {route.params.title}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View
            style={[
              {
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 100,
              },
              globalStyles.withMargin,
            ]}
          >
            <BasketCatImage />
            <Text level={6} weight="bold">
              No se encontró información
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
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>{content}</View>
  );
};
