import React, { ReactNode, useEffect, useReducer, useRef } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Keyboard,
  Modal,
  TextInput,
  View,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios, { CancelTokenSource } from 'axios';

// local components
import ProductCard from '../product-card';
// components
import Icon from '../../../../components/icon';
import Text from '../../../../components/text';
import Touchable from '../../../../components/touchable';
import Button from '../../../../components/buttons/button';
// clients
import storeProductClient from '../../../../clients/store-product-client';
// libs
import { capture } from '../../../../lib/sentry';
// cache
import userCache from '../../../../cache/user';
// types
import { Place, SearchResponse, StoreProduct, User } from '../../../../types';
// styles
import colors from '../../../../styles/colors';
import globalStyles from '../../../../styles';

// instances outside component
const prefix = '[search component]';
let timeoutId: number | undefined;
let fetchRequestSource: CancelTokenSource;

type SetUserAction = {
  type: 'set_user';
  user?: User;
};
type SetAddressAction = {
  type: 'set_address';
  address?: Place;
};
type SetVisibleAction = {
  type: 'set_visible';
  visible: boolean;
};
type SetQueryAction = {
  type: 'set_query';
  query: string;
};
type SetLoadingAction = {
  type: 'set_loading';
  loading: boolean;
};
type SetProductsAction = {
  type: 'set_products';
  products: SearchResponse<StoreProduct>;
};
type AddProductsAction = {
  type: 'add_products';
  products: SearchResponse<StoreProduct>;
};
type ResetProductsAction = {
  type: 'reset_products';
};
type SetErrorAction = {
  type: 'set_error';
  error: Error;
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
  | SetUserAction
  | SetAddressAction
  | SetVisibleAction
  | SetQueryAction
  | SetLoadingAction
  | SetProductsAction
  | AddProductsAction
  | ResetProductsAction
  | SetErrorAction
  | SetFetchingMoreAction
  | SetFetchMoreErrorAction;
type State = {
  user?: User;
  address?: Place;
  visible: boolean;
  query?: string;
  loading: boolean;
  products?: SearchResponse<StoreProduct>;
  error?: Error;
  fetching_more: boolean;
  fetch_more_error?: Error;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_user':
      return { ...state, user: action.user };
    case 'set_address':
      return { ...state, address: action.address };
    case 'set_visible':
      return {
        ...state,
        visible: action.visible,
        query: !action.visible ? '' : state.query,
      };
    case 'set_query':
      return { ...state, query: action.query };
    case 'set_loading':
      return {
        ...state,
        loading: action.loading,
        error: action.loading ? undefined : state.error,
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
    case 'reset_products':
      return {
        ...state,
        products: undefined,
      };
    case 'set_error':
      return { ...state, error: action.error };
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

interface ComponentProps {
  navigation: any;
}

export default ({ navigation }: ComponentProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    user: userCache.getData(),
    address: userCache.getAddress(),
    visible: false,
    loading: false,
    fetching_more: false,
  });

  // event handlers
  const search = async (query?: string) => {
    // cancel execution
    timeoutId && clearTimeout(timeoutId);
    // cancel request if running
    fetchRequestSource && fetchRequestSource.cancel();

    if (!query) {
      dispatch({ type: 'reset_products' });
      dispatch({ type: 'set_loading', loading: false });
      return;
    }

    dispatch({ type: 'set_loading', loading: true });
    // dealying search
    timeoutId = setTimeout(async () => {
      try {
        fetchRequestSource = axios.CancelToken.source();
        const response = await storeProductClient.search(
          {
            from: 0,
            size: 10,
            query,
            filters: {
              enabled: true,
              location: (state.address as Place).location,
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
        dispatch({ type: 'set_products', products: response });
      } catch (error) {
        if (!axios.isCancel(error)) {
          capture(prefix, 'Search error', error);

          dispatch({ type: 'set_error', error });
        }
      } finally {
        dispatch({ type: 'set_loading', loading: false });
      }
    }, 1000);
  };

  const fetchMore = async () => {
    dispatch({ type: 'set_fetching_more', fetching_more: true });
    // cancel execution
    timeoutId && clearTimeout(timeoutId);
    // cancel request if running
    fetchRequestSource && fetchRequestSource.cancel();

    // dealying search
    timeoutId = setTimeout(async () => {
      if (!state.products) {
        throw new Error(`${prefix} To fetch more must be state products`);
      }
      try {
        fetchRequestSource = axios.CancelToken.source();
        const response = await storeProductClient.search(
          {
            query: state.query,
            from: state.products.from,
            size: state.products.size,
            filters: state.products.filters,
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
        dispatch({ type: 'add_products', products: response });
      } catch (error) {
        if (!axios.isCancel(error)) {
          capture(prefix, 'Fetch more error', error);

          dispatch({ type: 'set_fetch_more_error', fetch_more_error: error });
        }
      } finally {
        dispatch({ type: 'set_fetching_more', fetching_more: false });
      }
    }, 0);
  };

  const pressSearchIconHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_visible', visible: true });
  };

  const showHandler = () => {
    ref.current?.focus();
  };

  const requestCloseHandler = () => {
    dispatch({ type: 'set_visible', visible: false });
  };

  const searchChangeTextHandler = (query: string) => {
    dispatch({ type: 'set_query', query });
  };

  const pressCancelSearchHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    Keyboard.dismiss();
    dispatch({ type: 'set_visible', visible: false });
    // cancel delayed call
    timeoutId && clearTimeout(timeoutId);
    // cancel request
    fetchRequestSource && fetchRequestSource.cancel();
  };

  const retryHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    search(state.query);
  };

  const pressProductCardHandler = (product: StoreProduct) => {
    dispatch({ type: 'set_visible', visible: false });
    navigation.navigate('Product', { product });
  };

  const retryFetchMoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    fetchMore();
  };

  useEffect(() => {
    const unsubscribe = userCache.onChange((user) => {
      dispatch({ type: 'set_user', user });
    });
    return () => {
      unsubscribe();

      // cancel delayed call
      timeoutId && clearTimeout(timeoutId);
      // cancel request
      fetchRequestSource && fetchRequestSource.cancel();
    };
  }, []);

  useEffect(() => {
    dispatch({ type: 'set_address', address: userCache.getAddress() });
  }, [state.user?.current_address]);

  useEffect(() => {
    search(state.query);
  }, [state.query]);

  // render logic
  const ref = useRef<TextInput>(null);
  let content: ReactNode = null;
  if (state.error) {
    content = (
      <TouchableWithoutFeedback
        style={{
          flex: 1,
        }}
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={[{ flex: 1 }, globalStyles.withMargin]}>
          <View
            style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text level={6} weight="bold" style={{ marginBottom: 15 }}>
              No se pudo cargar los productos
            </Text>
            <Text level={6} style={{ marginBottom: 10, textAlign: 'center' }}>
              Pero no te desanimes, reintentalo una vez más
            </Text>
            <Button title="Reintentar" type="link" onPress={retryHandler} />
          </View>
          <View style={{ flex: 1 }} />
        </View>
      </TouchableWithoutFeedback>
    );
  } else if (state.loading) {
    content = (
      <TouchableWithoutFeedback
        style={{
          flex: 1,
        }}
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={[{ flex: 1 }, globalStyles.withMargin]}>
          <View
            style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}
          >
            <ActivityIndicator size="small" color={colors.black} />
          </View>
          <View style={{ flex: 1 }} />
        </View>
      </TouchableWithoutFeedback>
    );
  } else if (!state.products) {
    content = null;
  } else if (!state.products.hits.length) {
    content = (
      <TouchableWithoutFeedback
        style={{
          flex: 1,
        }}
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={[{ flex: 1 }, globalStyles.withMargin]}>
          <View
            style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text level={6} weight="bold" style={{ marginBottom: 15 }}>
              No se encontraron productos
            </Text>
            <Text
              level={6}
              style={{ marginBottom: 10, textAlign: 'center', lineHeight: 23 }}
            >
              Revisa la octografía o prueba con otra búsqueda
            </Text>
          </View>
          <View style={{ flex: 1 }} />
        </View>
      </TouchableWithoutFeedback>
    );
  } else {
    content = (
      <FlatList
        keyboardDismissMode="on-drag"
        data={state.products.hits}
        numColumns={2}
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
        onEndReached={() => {
          if (state.products && state.products.from < state.products.total) {
            fetchMore();
          }
        }}
        style={[{ flex: 1, paddingTop: 15 }, globalStyles.withPadding]}
      />
    );
  }

  // break render
  if (!state.address) {
    return null;
  }

  return (
    <View>
      <Touchable
        style={{ paddingVertical: 5, paddingLeft: 15, paddingRight: 5 }}
        onPress={pressSearchIconHandler}
      >
        <Icon name="search" size={20} />
      </Touchable>

      {state.visible && (
        <Modal
          statusBarTranslucent
          animationType="fade"
          onShow={showHandler}
          onRequestClose={requestCloseHandler}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
            <View style={globalStyles.screenWithoutHeaderSpace} />

            <View
              style={[
                { flexDirection: 'row', marginBottom: 15 },
                globalStyles.withMargin,
              ]}
            >
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: 35,
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 9,
                }}
              >
                <Icon name="search" size={16} color={colors.blackLight2} />
              </View>
              <TextInput
                ref={ref}
                value={state.query}
                returnKeyType="search"
                placeholder="Buscar productos"
                clearButtonMode="while-editing"
                placeholderTextColor={colors.blackLight2}
                style={{
                  flex: 1,
                  paddingLeft: 35,
                  fontSize: 14,
                  fontFamily: 'MonserratNormal',
                  backgroundColor: colors.blackLight6,
                  borderRadius: 9,
                  minHeight: 35,
                }}
                onChangeText={searchChangeTextHandler}
              />
              <Button
                type="link"
                title={
                  <Text level={6} weight="bold" color={colors.blue}>
                    Cancelar
                  </Text>
                }
                style={{ paddingLeft: 10, paddingRight: 0 }}
                onPress={pressCancelSearchHandler}
              />
            </View>

            {content}
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
};
