import React, { useCallback, useEffect, useReducer } from 'react';
import { FlatList, GestureResponderEvent, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios, { CancelTokenSource } from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// local components
import ProductItem from './components/product-item';
import Skeletton from './components/skeletton';
// components
import Text from '../../../components/text';
import LogoBackgroundWhiteImage from '../../../components/svgs/images/bag-logo-background-white';
import Button from '../../../components/buttons/button';
import ErrorView from '../../../components/error-view';
import Touchable from '../../../components/touchable';
import Icon from '../../../components/icon';
import PhoneWithProductsImage from '../../../components/svgs/images/phone-with-products-view';
// clients
import storeClient from '../../../clients/store-client';
import productClient from '../../../clients/product-client';
// cache
import userCache from '../../../cache/user';
import storeCache from '../../../cache/store';
// libs
import { capture } from '../../../lib/sentry';
// types
import { LoggedUser, Product, SearchResponse, Store } from '../../../types';
// styles
import colors from '../../../styles/colors';
import globalStyles from '../../../styles';

// instances outside component
const prefix = '[my store screen]';
let fetchStoreRequestSource: CancelTokenSource;
let fetchProductsRequestSource: CancelTokenSource;

type SetUserAction = {
  type: 'set_user';
  user: LoggedUser;
};
type SetStoreAction = {
  type: 'set_store';
  store?: Store;
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
type AddProductAction = {
  type: 'add_product';
  add: Product;
};
type UpdateProductAction = {
  type: 'update_product';
  update: Product;
};
type DeleteProductAction = {
  type: 'delete_product';
  delete: string;
};
type Action =
  | SetUserAction
  | SetStoreAction
  | ResetAction
  | SetProductsAction
  | SetErrorAction
  | SetRefreshingAction
  | SetFetchingMoreAction
  | AddProductAction
  | UpdateProductAction
  | DeleteProductAction;
type State = {
  user?: LoggedUser;
  store?: Store;
  products?: SearchResponse<Product>;
  error?: Error;
  refreshing: boolean;
  fetching_more: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_user':
      return { ...state, user: action.user };
    case 'set_store':
      return { ...state, store: action.store };
    case 'reset':
      return { ...state, products: undefined, error: undefined };
    case 'set_products':
      return { ...state, products: action.products };
    case 'set_error':
      return { ...state, error: action.error };
    case 'set_refreshing':
      return { ...state, refreshing: action.refreshing };
    case 'add_product':
      return {
        ...state,
        products: (() => {
          if (!state.products) {
            return {
              from: 1,
              size: 10,
              total: 1,
              hits: [action.add],
            };
          }
          return {
            ...state.products,
            from: state.products.from + 1,
            total: state.products.total + 1,
            hits: [action.add, ...state.products.hits],
          };
        })(),
      };
    case 'update_product':
      if (!state.products) {
        return state;
      }
      return {
        ...state,
        products: {
          ...state.products,
          hits: [
            action.update,
            ...state.products.hits.filter(
              (product) => product.id !== action.update.id
            ),
          ],
        },
      };
    case 'delete_product':
      if (!state.products) {
        return state;
      }
      return {
        ...state,
        products: {
          ...state.products,
          from: state.products.from - 1,
          total: state.products.total - 1,
          hits: state.products.hits.filter(
            (product) => product.id !== action.delete
          ),
        },
      };
    default:
      return state;
  }
};

interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    refreshing: false,
    fetching_more: false,
  });

  // event handlers
  const hydrate = async () => {
    try {
      const current = storeCache.getData();
      if (current) {
        return;
      }
      if (fetchStoreRequestSource) {
        fetchStoreRequestSource.cancel();
      }
      fetchStoreRequestSource = axios.CancelToken.source();
      const store = await storeClient.get(
        {
          pathVars: {
            id: state.user?.current_store,
          },
        },
        fetchStoreRequestSource.token
      );
      storeCache.setData(store);
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Hydrate error', error);

        dispatch({ type: 'set_error', error });
      }
    }
  };

  const fetch = async (from = 0, size = 10) => {
    if (fetchProductsRequestSource) {
      fetchProductsRequestSource.cancel();
    }
    fetchProductsRequestSource = axios.CancelToken.source();
    const response = await productClient.search(
      {
        pathVars: {
          storeId: state.user?.current_store,
        },
        from,
        size,
        sort: { updated_at: 'desc' },
      },
      fetchProductsRequestSource.token
    );
    return response;
  };

  const load = async () => {
    try {
      dispatch({ type: 'reset' });
      const response = await fetch();
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

  const boot = () => {
    Promise.all([hydrate(), load()]);
  };

  const refresh = async () => {
    try {
      dispatch({ type: 'set_refreshing', refreshing: true });
      const response = await fetch();
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
      dispatch({ type: 'set_error', error: undefined });
      dispatch({ type: 'set_fetching_more', fetching_more: true });
      const products = await fetch(state.products.from, state.products.size);
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

  const pressCreateStoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('UpsertStore');
  };

  const retryHandler = () => {
    if (!state.store || !state.products) {
      boot();
    } else {
      fetchMore();
    }
  };

  const pressAddProductHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('UpsertProduct');
  };

  const pressMenuHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('SellerMenu');
  };

  useEffect(() => {
    return () => {
      if (fetchStoreRequestSource) {
        fetchStoreRequestSource.cancel();
      }
      if (fetchProductsRequestSource) {
        fetchProductsRequestSource.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!userCache.isLogged()) {
      navigation.replace('SignIn', {
        redirect: {
          name: 'MyStore',
        },
        dont_allow_guest: true,
        reason: 'to_sell',
      });
    }
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

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = storeCache.onChange((store) => {
        dispatch({ type: 'set_store', store });
      });
      return () => {
        unsubscribe();
      };
    }, [])
  );

  useEffect(() => {
    if (state.user?.current_store) {
      boot();
    }
  }, [state.user?.current_store]);

  useEffect(() => {
    if (route.params?.add) {
      dispatch({ type: 'add_product', add: route.params?.add });
    }
  }, [route.params?.add]);

  useEffect(() => {
    if (route.params?.update) {
      dispatch({ type: 'update_product', update: route.params?.update });
    }
  }, [route.params?.update]);

  useEffect(() => {
    if (route.params?.delete) {
      dispatch({ type: 'delete_product', delete: route.params?.delete });
    }
  }, [route.params?.delete]);
  // render logic
  const insets = useSafeAreaInsets();

  if (!state.user?.email) {
    return null;
  }

  if (!state.user.current_store) {
    return (
      <View
        style={{
          backgroundColor: colors.blue,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <LogoBackgroundWhiteImage />
        <Text
          level={1}
          weight="bold"
          color={colors.white}
          style={{ marginTop: 25, marginBottom: 10, textAlign: 'center' }}
        >
          ¡Vende con nosotros!
        </Text>
        <Text
          level={5}
          color={colors.white}
          style={{
            lineHeight: 23,
            textAlign: 'center',
            marginHorizontal: 20,
          }}
        >
          Crea tu tienda para ofrecer tus productos y llegar a clientes
          totalmente gratis.
        </Text>
        <View
          style={[
            { position: 'absolute', bottom: 0, left: 0, right: 0 },
            globalStyles.withMargin,
          ]}
        >
          <Button
            title="Crear tienda"
            type="secondary"
            style={globalStyles.withMainActionAir}
            onPress={pressCreateStoreHandler}
          />
        </View>
      </View>
    );
  }

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

  if (!state.store || !state.products) {
    return <Skeletton />;
  }

  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.white, paddingTop: insets.top },
      ]}
    >
      <View style={globalStyles.screenWithoutHeaderSpace} />
      <Touchable
        style={[
          { flexDirection: 'row', alignItems: 'center', paddingBottom: 5 },
          globalStyles.withMargin,
        ]}
        onPress={pressMenuHandler}
      >
        <View style={{ width: 50, alignItems: 'center' }}>
          <Icon name="menu" />
        </View>
        <Text
          level={2}
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginLeft: 15 }}
        >
          {state.store.name}
        </Text>
      </Touchable>
      <FlatList
        data={state.products.hits}
        refreshing={state.refreshing}
        keyExtractor={(item: Product) => item.id}
        renderItem={({ item }) => {
          return (
            <ProductItem
              key={`${item.id}`}
              data={item}
              navigation={navigation}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', marginTop: 50 }}>
            <PhoneWithProductsImage />
            <Text
              level={5}
              weight="bold"
              style={{ marginTop: 40, marginBottom: 15 }}
            >
              Aun no agregas productos
            </Text>
          </View>
        }
        ListFooterComponent={<View style={globalStyles.withScreenAir} />}
        onRefresh={refresh}
        onEndReached={() => {
          if (state.products && state.products.from < state.products.total) {
            fetchMore();
          }
        }}
        style={[{ flex: 1, paddingTop: 10 }, globalStyles.withPadding]}
      />
      <View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.white,
            paddingTop: 2,
          },
          globalStyles.withMargin,
        ]}
      >
        <Button
          title="Agregar producto"
          style={globalStyles.withMainActionAir}
          onPress={pressAddProductHandler}
        />
      </View>
    </View>
  );
};
