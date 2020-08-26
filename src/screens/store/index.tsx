import React, {
  useReducer,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useCallback,
} from 'react';
import {
  View,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  GestureResponderEvent,
} from 'react-native';
import axios, { CancelTokenSource } from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import Button from '../../components/buttons/button';
import Text from '../../components/text';
import Icon from '../../components/icon';
import Badge from '../../components/badge';
import Search from '../../components/inputs/search';
import NotSearchResult from '../../components/not-search-result';
import Divider from '../../components/divider';
// local components
import Skeletton from './components/skeleton';
import Item from './components/item';
import ShoppingCartModal from './components/shopping-cart-modal';
// clients
import productClient from '../../clients/product-client';
// cache
import userCache from '../../cache/user';
import shoppingCartsCache from '../../cache/shopping-carts';
import ShoppingCartCache, {
  ShoppingCartSnapshot,
} from '../../cache/shopping-cart';
// libs
import numberFormatter from '../../lib/formatters/number-formatter';
import useDebounce from '../../lib/hooks/use-debounce';
import * as utils from '../../lib/utils';
// types
import {
  SearchResponse,
  Product,
  SearchFilters,
  Store,
  User,
} from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';
import { Touchable, ErrorView } from '../../components';

// instances outside component
const prefix = '[store screen]';
let fetchRequestSource: CancelTokenSource;
const defaultSize = 10;

type SetHeaderAction = {
  type: 'set_header';
  header: boolean;
};
type SetQueryAction = {
  type: 'set_query';
  query: string;
};
type SetShoppingCartCacheAction = {
  type: 'set_shopping_cart_cache';
  shopping_cart_cache: ShoppingCartCache;
};
type SetShoppingCartSnapshotAction = {
  type: 'set_shopping_cart_snapshot';
  shopping_cart_snapshot: ShoppingCartSnapshot;
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
  error: Error | undefined;
};
type SetRefreshingAction = {
  type: 'set_refreshing';
  refreshing: boolean;
};
type SetFetchingMoreAction = {
  type: 'set_fetching_more';
  fetching_more: boolean;
};
type SetModalAction = {
  type: 'set_modal';
  modal: boolean;
};
type Action =
  | SetHeaderAction
  | SetQueryAction
  | SetShoppingCartCacheAction
  | SetShoppingCartSnapshotAction
  | ResetAction
  | SetProductsAction
  | SetErrorAction
  | SetRefreshingAction
  | SetFetchingMoreAction
  | SetModalAction;
type State = {
  header: boolean;
  query: string;
  shopping_cart_cache?: ShoppingCartCache;
  shopping_cart_snapshot?: ShoppingCartSnapshot;
  products?: SearchResponse<Product>;
  error?: Error;
  refreshing: boolean;
  fetching_more: boolean;
  modal: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_header':
      return { ...state, header: action.header };
    case 'set_query':
      return { ...state, query: action.query };
    case 'set_shopping_cart_cache':
      return { ...state, shopping_cart_cache: action.shopping_cart_cache };
    case 'set_shopping_cart_snapshot':
      return {
        ...state,
        shopping_cart_snapshot: action.shopping_cart_snapshot,
      };
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
    case 'set_modal':
      return { ...state, modal: action.modal };
    default:
      return state;
  }
};

export interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  // params
  const store = route.params.store as Store;
  if (!store) {
    throw new Error(`${prefix} Store param must be defined`);
  }
  // state
  const [state, dispatch] = useReducer(reducer, {
    header: true,
    query: '',
    refreshing: false,
    fetching_more: false,
    modal: false,
  });
  const user = userCache.getData();
  const debouncedQuery = useDebounce(state.query, 500);
  const insets = useSafeAreaInsets();

  // event handlers
  const instanceCache = async () => {
    const cache = await shoppingCartsCache.get(store.id);
    dispatch({ type: 'set_shopping_cart_cache', shopping_cart_cache: cache });
  };

  const searchFocusHandler = () => {
    dispatch({ type: 'set_header', header: false });
  };

  const searchBlurHandler = () => {
    dispatch({ type: 'set_header', header: true });
  };

  const changeQuery = (query: string) => {
    dispatch({ type: 'set_query', query });
  };

  const fetch = async (
    query: string,
    filters: SearchFilters,
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
          storeId: store.id,
        },
        query,
        filters,
        from,
        size,
      },
      fetchRequestSource.token
    );
    return response;
  };

  const load = async (query: string) => {
    try {
      dispatch({ type: 'reset' });
      const response = await fetch(query, {
        enabled: true,
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
        // TODO: Log error
        console.log(error);

        dispatch({ type: 'set_error', error });
      }
    }
  };

  const refresh = async () => {
    try {
      dispatch({ type: 'set_refreshing', refreshing: true });
      const response = await fetch(state.query, {
        enabled: true,
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
        // TODO: Log error
        console.log(error);

        dispatch({ type: 'set_error', error });
      }
    } finally {
      dispatch({ type: 'set_refreshing', refreshing: false });
    }
  };

  const fetchMore = async () => {
    if (!state.products) {
      throw new Error(`${prefix} Products must be defined to fetch more`);
    }
    try {
      dispatch({ type: 'set_fetching_more', fetching_more: true });
      const products = await fetch(
        state.query,
        {
          enabled: true,
        },
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
        // TODO: Log error
        console.log(error);

        dispatch({ type: 'set_error', error });
      }
    } finally {
      dispatch({ type: 'set_fetching_more', fetching_more: false });
    }
  };

  const retryHandler = () => {
    dispatch({ type: 'set_error', error: undefined });
    if (!state.products) {
      load(state.query);
    } else {
      fetchMore();
    }
  };

  const pressMyOrderHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_modal', modal: true });
  };

  const pressShoppingCartHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_modal', modal: true });
  };

  const closeShoppingCartHandler = () => {
    dispatch({ type: 'set_modal', modal: false });
  };

  useEffect(() => {
    instanceCache();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let unsubscribe: any = utils.noop;
      if (state.shopping_cart_cache) {
        unsubscribe = state.shopping_cart_cache.onChange(() => {
          const snapshopt = (state.shopping_cart_cache as ShoppingCartCache).getSnapshot();
          dispatch({
            type: 'set_shopping_cart_snapshot',
            shopping_cart_snapshot: snapshopt,
          });
        });
      }
      return () => {
        unsubscribe();
      };
    }, [state.shopping_cart_cache])
  );

  useEffect(() => {
    load(debouncedQuery);
  }, [debouncedQuery]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: store.name,
      headerRight: () => {
        let cartButton: ReactNode | null = null;
        if (
          state.shopping_cart_snapshot &&
          state.shopping_cart_snapshot.stats.total > 0
        ) {
          cartButton = (
            <Touchable
              style={{
                position: 'relative',
                paddingHorizontal: 2,
                paddingVertical: 2,
                marginRight: 10,
              }}
              onPress={pressShoppingCartHandler}
            >
              <View
                style={{
                  position: 'absolute',
                  top: -8,
                  left: -5,
                  zIndex: 100,
                  minWidth: 50,
                }}
              >
                <Badge count={state.shopping_cart_snapshot.stats.total} />
              </View>
              <Icon name="shopping-cart" />
            </Touchable>
          );
        }
        return cartButton;
      },
    });
  }, [state.shopping_cart_snapshot?.stats.total]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: state.header,
    });
  }, [state.header]);

  // render logic
  let content: ReactNode;
  if (state.error) {
    content = (
      <View
        style={[
          {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          },
          globalStyles.withPadding,
        ]}
      >
        <ErrorView onRetry={retryHandler} />
      </View>
    );
  } else if (!state.products) {
    content = <Skeletton />;
  } else if (!debouncedQuery && !state.products.hits.length) {
    content = (
      <View
        style={[
          {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          },
          globalStyles.withPadding,
        ]}
      >
        <Text level={7} weight="bold">
          El vendedor aún no ha publicado productos
        </Text>
      </View>
    );
  } else if (debouncedQuery && !state.products.hits.length) {
    content = (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
          <NotSearchResult />
        </View>
      </TouchableWithoutFeedback>
    );
  } else {
    content = (
      <FlatList
        initialNumToRender={defaultSize}
        refreshing={state.refreshing}
        data={state.products.hits}
        style={[{ flex: 1, paddingTop: 20 }, globalStyles.withPadding]}
        keyExtractor={(product) => product.id}
        renderItem={({ item, index }) => {
          let divider: ReactNode | null = <Divider />;
          const products = state.products as SearchResponse<Product>;
          if (index === products.hits.length - 1) {
            divider = null;
          }
          return (
            <View style={{ marginTop: 15 }}>
              <Item data={item} />
              <View style={{ height: 20 }} />
              {divider}
            </View>
          );
        }}
        ListFooterComponent={<View style={globalStyles.withScreenAir} />}
        onRefresh={refresh}
        onEndReached={() => {
          if (state.products && state.products.from < state.products.total) {
            fetchMore();
          }
        }}
      />
    );
  }

  let orderButton: ReactNode | null = null;
  if (
    state.shopping_cart_snapshot &&
    state.shopping_cart_snapshot.items.length
  ) {
    orderButton = (
      <Button
        title={
          <View style={{ flexDirection: 'row' }}>
            <Text level={6} weight="bold" color={colors.white}>
              Mi Pedido
            </Text>
            <View style={{ flex: 1 }} />
            <Text level={5} weight="bold" color={colors.white}>
              {numberFormatter.toCurrency(
                state.shopping_cart_snapshot.stats.ammount
              )}
            </Text>
          </View>
        }
        style={globalStyles.withMainActionAir}
        onPress={pressMyOrderHandler}
      />
    );
  }
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.white,
        paddingTop: state.header ? 0 : insets.top,
      }}
    >
      <Search
        value={state.query}
        placeholder="Buscar productos"
        onChangeText={changeQuery}
        onFocus={searchFocusHandler}
        onBlur={searchBlurHandler}
        containerStyle={globalStyles.withMargin}
      />
      {content}
      <View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
          globalStyles.withMargin,
        ]}
      >
        {orderButton}
      </View>
      {state.modal && (
        <ShoppingCartModal
          user={user as User}
          store={store}
          snapshot={state.shopping_cart_snapshot as ShoppingCartSnapshot}
          onClose={closeShoppingCartHandler}
        />
      )}
    </View>
  );
};
