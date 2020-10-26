import React, {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
} from 'react';
import {
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  GestureResponderEvent,
  RefreshControl,
} from 'react-native';
import axios, { CancelTokenSource } from 'axios';
import { useFocusEffect } from '@react-navigation/native';

// components
import Text from '../../components/text';
import Divider from '../../components/divider';
import Touchable from '../../components/touchable';
import Icon from '../../components/icon';
import Button from '../../components/buttons/button';
// screen components
import ShoppingCartIcon from '../components/shopping-cart-icon';
import ProductCard from '../components/product-card';
// local components
import ProductDetailsCard from './components/product-details-card';
// clients
import storeClient from '../../clients/store-client';
import productClient from '../../clients/product-client';
// cache
import shoppingCartCache, { getAmount } from '../../cache/shopping-cart';
// libs
import numberFormatter from '../../lib/formatters/number-formatter';
import durationFormatter from '../../lib/formatters/duration-formatter';
import cloudinary from '../../lib/cloudinary';
import { capture } from '../../lib/sentry';
import * as utils from '../../lib/utils';
// types
import { Product, SearchResponse, Store } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[product screen]';
let fetchStoreRequestSource: CancelTokenSource;
let fetchProductsRequestSource: CancelTokenSource;
const defaultSize = 10;

type ResetAction = {
  type: 'reset';
};
type SetStoreAction = {
  type: 'set_store';
  store: Store;
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
type SetAmountAction = {
  type: 'set_amount';
  amount: number;
};
type Action =
  | ResetAction
  | SetStoreAction
  | SetProductsAction
  | SetErrorAction
  | SetRefreshingAction
  | SetAmountAction;
type State = {
  store?: Store;
  products?: SearchResponse<Product>;
  error?: Error;
  refreshing: boolean;
  amount?: number;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'reset':
      return {
        ...state,
        store: undefined,
        products: undefined,
        error: undefined,
      };
    case 'set_store':
      return { ...state, store: action.store };
    case 'set_products':
      return { ...state, products: action.products };
    case 'set_error':
      return { ...state, error: action.error };
    case 'set_refreshing':
      return { ...state, refreshing: action.refreshing };
    case 'set_amount':
      return { ...state, amount: action.amount };
    default:
      return state;
  }
};

interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  const product: Product = route.params.product;
  if (!product) {
    throw new Error(`${prefix} Product param is required`);
  }
  // state
  const [state, dispatch] = useReducer(reducer, {
    refreshing: false,
  });

  // event handlers
  const fetchStore = async () => {
    try {
      if (fetchStoreRequestSource) {
        fetchStoreRequestSource.cancel();
      }
      fetchStoreRequestSource = axios.CancelToken.source();
      const store = await storeClient.get(
        {
          pathVars: {
            id: product.store_info.id,
          },
        },
        { cancelToken: fetchStoreRequestSource.token }
      );
      dispatch({ type: 'set_store', store });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Fetch store error', error);

        dispatch({ type: 'set_error', error });
      }
    }
  };

  const fetchProducts = async () => {
    try {
      if (fetchProductsRequestSource) {
        fetchProductsRequestSource.cancel();
      }
      fetchProductsRequestSource = axios.CancelToken.source();
      const products = await productClient.search(
        {
          pathVars: {
            storeId: product.store_info.id,
          },
          filters: {
            enabled: true,
            must_not_id: product.id,
          },
          from: 0,
          size: defaultSize,
        },
        { cancelToken: fetchProductsRequestSource.token }
      );
      dispatch({ type: 'set_products', products });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Fetch products error', error);

        dispatch({ type: 'set_error', error });
      }
    }
  };

  const load = () => {
    dispatch({ type: 'reset' });
    Promise.all([fetchStore(), fetchProducts()]);
  };

  const refresh = () => {
    dispatch({ type: 'set_refreshing', refreshing: true });
    Promise.all([fetchStore(), fetchProducts()]);
    dispatch({ type: 'set_refreshing', refreshing: false });
  };

  const pressProductHandler = useCallback((product: Product) => {
    navigation.push('Product', { product });
  }, []);

  const pressSeeStoreHandler = (store: Store) => {
    navigation.push('Store', { store });
  };

  const retryHandler = () => {
    load();
  };

  const pressMyOrderHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('ShoppingCartStack');
  };

  useEffect(() => {
    load();
  }, [product]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <ShoppingCartIcon style={{ marginRight: 20 }} />,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = shoppingCartCache.onChangeStore(
        product.store_info.id,
        (data) => {
          dispatch({ type: 'set_amount', amount: getAmount(data) });
        }
      );
      return () => {
        unsubscribe();
      };
    }, [])
  );

  // render logic
  let storeComponent: ReactNode = (
    <>
      <ActivityIndicator
        size="small"
        color={colors.black}
        style={{ alignSelf: 'center', marginVertical: 20 }}
      />
      <Divider type="thick" />
    </>
  );
  let productsComponent: ReactNode = (
    <ActivityIndicator
      size="small"
      color={colors.black}
      style={{ alignSelf: 'center', marginTop: 40 }}
    />
  );
  if (state.store) {
    const openInfo = utils.humanizeOpenInfo(state.store.opening_hours);
    storeComponent = (
      <>
        <Touchable
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 15,
            },
            globalStyles.withMargin,
          ]}
          onPress={(event: GestureResponderEvent) => {
            event.stopPropagation();
            pressSeeStoreHandler(state.store as Store);
          }}
        >
          <Image
            source={{
              uri: cloudinary.dynamicUrl(state.store.images[0], 'h_500'),
            }}
            style={{ width: 60, height: 60, borderRadius: 100 }}
          />
          <View style={{ flex: 1, marginHorizontal: 15 }}>
            <Text
              level={4}
              weight="bold"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ marginBottom: 5 }}
            >
              {state.store.name}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 3,
              }}
            >
              <Icon name="clock" size={16} />
              <Text
                level={7}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ flex: 1, marginLeft: 5 }}
              >
                {durationFormatter.humanizeDurationRange(
                  state.store.delivery_time.gte,
                  state.store.delivery_time.lte
                )}
              </Text>
            </View>
            {!openInfo.open && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 0,
                }}
              >
                <Icon name="calendar" size={16} />
                <Text
                  level={7}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  color={openInfo.open ? colors.black : colors.red}
                  style={{ flex: 1, marginLeft: 5 }}
                >
                  {openInfo.message}
                </Text>
              </View>
            )}
          </View>
          <Icon name="chevron-right" />
        </Touchable>
        <Divider type="thick" />
      </>
    );
    if (state.products) {
      productsComponent = null;
      if (state.products.hits.length) {
        let seeStore: ReactNode = null;
        if (state.products.total > state.products.hits.length) {
          seeStore = (
            <>
              <Touchable
                style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 30,
                  },
                ]}
                onPress={(event: GestureResponderEvent) => {
                  event.stopPropagation();
                  pressSeeStoreHandler(state.store as Store);
                }}
              >
                <Image
                  source={{
                    uri: cloudinary.dynamicUrl(state.store.images[0], 'h_500'),
                  }}
                  style={{ width: 60, height: 60, borderRadius: 100 }}
                />
                <View style={{ flex: 1, marginHorizontal: 15 }}>
                  <Text
                    level={4}
                    weight="bold"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {state.store.name}
                  </Text>
                  <Text level={6}>Ver tienda</Text>
                </View>
                <Icon name="chevron-right" />
              </Touchable>
            </>
          );
        }
        productsComponent = (
          <View style={[{ paddingTop: 15 }, globalStyles.withMargin]}>
            <Text
              level={4}
              weight="bold"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ marginBottom: 15 }}
            >
              Más productos de esta tienda
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {state.products.hits.map((product, index) => {
                return (
                  <ProductCard
                    key={`${product.id}`}
                    store={state.store as Store}
                    product={product}
                    align={index % 2 === 0 ? 'left' : 'right'}
                    onPress={pressProductHandler}
                  />
                );
              })}
            </View>
            {seeStore}
          </View>
        );
      }
    }
  }

  let content = (
    <View>
      {storeComponent}
      {productsComponent}
    </View>
  );
  if (state.error) {
    content = (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 40,
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
  }
  let orderButton: ReactNode = null;
  if (state.amount && state.amount > 0) {
    orderButton = (
      <Button
        title={
          <View style={{ flexDirection: 'row' }}>
            <Text level={6} weight="bold" color={colors.white}>
              Mi Pedido
            </Text>
            <View style={{ flex: 1 }} />
            <Text level={5} weight="bold" color={colors.white}>
              {numberFormatter.toCurrency(state.amount)}
            </Text>
          </View>
        }
        style={globalStyles.withMainActionAir}
        onPress={pressMyOrderHandler}
      />
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={state.refreshing} onRefresh={refresh} />
        }
        style={{ flex: 1 }}
      >
        <ProductDetailsCard
          store={state.store}
          product={product}
          style={[{ paddingTop: 7, marginBottom: 10 }, globalStyles.withMargin]}
        />
        <Divider type="thick" />
        {content}
        <View style={globalStyles.withScreenAir} />
      </ScrollView>

      <View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
          globalStyles.withMargin,
        ]}
      >
        {orderButton}
      </View>
    </View>
  );
};
