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
  GestureResponderEvent,
  RefreshControl,
} from 'react-native';
import axios, { CancelTokenSource } from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import * as Linking from 'expo-linking';

// ga
import * as ga from './ga';
// local components
import Carousell from './components/carousell';
import NumberInput from './components/number-input';
// screen components
import ProductCard from '../components/product-card';
import InfoDialog from '../components/dialogs/info-dialog';
import ShoppingCartIcon from '../components/shopping-cart-icon';
// components
import Text from '../../components/text';
import Icon from '../../components/icon';
import Bone from '../../components/bone';
import Image from '../../components/image';
import Divider from '../../components/divider';
import Touchable from '../../components/touchable';
import Button from '../../components/buttons/button';
import ReadMore from '../../components/text/read-more';
// clients
import storeClient from '../../clients/store-client';
import productClient from '../../clients/product-client';
// cache
import shoppingCartCache, { getAmount } from '../../cache/shopping-cart';
// libs
import {
  CurrentOpenginHours,
  extractCurrentOpeningHours,
  humanizeCurrentClosedOpeningHours,
  noop,
} from '../../lib/utils';
import { capture } from '../../lib/sentry';
import cloudinary from '../../lib/cloudinary';
import numberFormatter from '../../lib/formatters/number-formatter';
import durationFormatter from '../../lib/formatters/duration-formatter';
// types
import { Product, SearchResponse, Store } from '../../types';
// styles
import globalStyles from '../../styles';
import colors from '../../styles/colors';

// instances outside component
const prefix = '[product screen]';
let fetchProductRequestSource: CancelTokenSource;
let fetchStoreRequestSource: CancelTokenSource;
let fetchProductsRequestSource: CancelTokenSource;
const defaultSize = 10;

type ResetAction = {
  type: 'reset';
};
type SetProductAction = {
  type: 'set_product';
  product: Product;
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
  error?: Error;
};
type SetRefreshingAction = {
  type: 'set_refreshing';
  refreshing: boolean;
};
type SetAmountAction = {
  type: 'set_amount';
  amount: number;
};
type SetCurrentOpeningHoursAction = {
  type: 'set_current_opening_hours';
  current_opening_hours?: CurrentOpenginHours;
};
type SetWhatsappNotFoundDialogAction = {
  type: 'set_whatsapp_not_found_dialog';
  whatsapp_not_found_dialog: boolean;
};
type SetProductQtyAction = {
  type: 'set_product_qty';
  product_qty: number;
};
type Action =
  | ResetAction
  | SetProductAction
  | SetStoreAction
  | SetProductsAction
  | SetErrorAction
  | SetRefreshingAction
  | SetAmountAction
  | SetCurrentOpeningHoursAction
  | SetWhatsappNotFoundDialogAction
  | SetProductQtyAction;
type State = {
  product: Product;
  store?: Store;
  products?: SearchResponse<Product>;
  error?: Error;
  refreshing: boolean;
  amount?: number;
  current_opening_hours?: CurrentOpenginHours;
  whatsapp_not_found_dialog: boolean;
  product_qty?: number;
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
    case 'set_product':
      return { ...state, product: action.product };
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
    case 'set_current_opening_hours':
      return { ...state, current_opening_hours: action.current_opening_hours };
    case 'set_whatsapp_not_found_dialog':
      return {
        ...state,
        whatsapp_not_found_dialog: action.whatsapp_not_found_dialog,
      };
    case 'set_product_qty':
      return {
        ...state,
        product_qty: action.product_qty,
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
    product:
      typeof route.params.product === 'string'
        ? { id: route.params.product }
        : route.params.product,
    refreshing: false,
    whatsapp_not_found_dialog: false,
  });

  // event handlers
  const fetchProduct = async () => {
    if (fetchProductRequestSource) {
      fetchProductRequestSource.cancel();
    }
    fetchProductRequestSource = axios.CancelToken.source();
    const product = await productClient.get(
      {
        pathVars: {
          storeId: state.product.store,
          id: state.product.id,
        },
        source: ['id', 'images', 'name', 'description', 'price', 'store'],
      },
      { cancelToken: fetchProductRequestSource.token }
    );
    return product;
  };

  const loadProduct = async () => {
    try {
      const product = await fetchProduct();
      dispatch({ type: 'set_product', product });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Load product error', error);

        dispatch({ type: 'set_error', error });
      }
    }
  };

  const refreshProduct = async () => {
    try {
      const product = await fetchProduct();
      dispatch({ type: 'set_product', product });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Refresh product error', error);
      }
    }
  };

  const fetchStore = async () => {
    if (fetchStoreRequestSource) {
      fetchStoreRequestSource.cancel();
    }
    fetchStoreRequestSource = axios.CancelToken.source();
    const store = await storeClient.get(
      {
        pathVars: {
          id: state.product.store,
        },
        source: [
          'id',
          'images',
          'name',
          'delivery_time',
          'opening_hours',
          'phone',
        ],
      },
      { cancelToken: fetchStoreRequestSource.token }
    );
    return store;
  };

  const loadStore = async () => {
    try {
      const store = await fetchStore();
      dispatch({ type: 'set_store', store });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Load store error', error);

        dispatch({ type: 'set_error', error });
      }
    }
  };

  const refreshStore = async () => {
    try {
      const store = await fetchStore();
      dispatch({ type: 'set_store', store });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Refresh store error', error);
      }
    }
  };

  const fetchProducts = async () => {
    if (fetchProductsRequestSource) {
      fetchProductsRequestSource.cancel();
    }
    fetchProductsRequestSource = axios.CancelToken.source();
    const products = await productClient.search(
      {
        pathVars: {
          storeId: state.product.store,
        },
        filters: {
          enabled: true,
          must_not_id: state.product.id,
        },
        from: 0,
        size: defaultSize,
        sort: { updated_at: 'desc' },
        source: ['id', 'images', 'name', 'price', 'store'],
      },
      { cancelToken: fetchProductsRequestSource.token }
    );
    return products;
  };

  const loadProducts = async () => {
    try {
      const products = await fetchProducts();
      dispatch({ type: 'set_products', products });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Load products error', error);

        dispatch({ type: 'set_error', error });
      }
    }
  };

  const refreshProducts = async () => {
    try {
      const products = await fetchProducts();
      dispatch({ type: 'set_products', products });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Refresh products error', error);
      }
    }
  };

  const load = () => {
    dispatch({ type: 'reset' });
    const promises: Promise<void>[] = [loadProduct()];
    if (state.product.store) {
      promises.push(loadStore(), loadProducts());
    }
    Promise.all(promises);
  };

  const refresh = async () => {
    dispatch({ type: 'set_refreshing', refreshing: true });
    const promises: Promise<void>[] = [refreshProduct()];
    if (state.product.store) {
      promises.push(refreshStore(), refreshProducts());
    }
    await Promise.all(promises);
    dispatch({ type: 'set_refreshing', refreshing: false });
  };

  const pressProductHandler = useCallback((product: Product) => {
    navigation.push('Product', {
      product,
      attribution: route.params.attribution,
    });
  }, []);

  const pressSeeStoreHandler = (store: Store) => {
    navigation.push('Store', { store, attribution: route.params.attribution });
  };

  const retryHandler = () => {
    load();
  };

  const pressMyOrderHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('ShoppingCartStack', {
      screen: 'ShoppingCart',
      params: { attribution: route.params.attribution },
    });
  };

  const pressSendToWhatsappHandler = async (event: GestureResponderEvent) => {
    event.stopPropagation();
    try {
      await Linking.openURL(
        `whatsapp://send?text=${encodeURIComponent(
          `Hola, vengo de Shop Shop 👋\n\n✅ ${
            state.product.name
          } · ${numberFormatter.toCurrency(
            state.product.price
          )}\n\n¿Está disponible? 🤔`
        )}&phone=${state.store?.phone}`
      );
      // send product message event to ga
      await ga.sendProductMessageEvent(
        state.store as Store,
        state.product,
        route.params.attribution
      );
    } catch (error) {
      capture(prefix, 'Press send to whatsapp hanlder error', error);

      dispatch({
        type: 'set_whatsapp_not_found_dialog',
        whatsapp_not_found_dialog: true,
      });
    }
  };

  const whatsappNotFoundDialogOnOkHandler = () => {
    dispatch({
      type: 'set_whatsapp_not_found_dialog',
      whatsapp_not_found_dialog: false,
    });
  };

  const changeProductQtyHandler = (qty: number) => {
    shoppingCartCache.set(state.store as Store, state.product, qty);
  };

  useEffect(() => {
    return () => {
      fetchProductRequestSource && fetchProductRequestSource.cancel();
      fetchStoreRequestSource && fetchStoreRequestSource.cancel();
      fetchProductsRequestSource && fetchProductsRequestSource.cancel();
    };
  }, []);

  useEffect(() => {
    if (state.product.id) {
      loadProduct();
    }
  }, [state.product.id]);

  useEffect(() => {
    if (state.product.store) {
      Promise.all([loadStore(), loadProducts()]);
    }
  }, [state.product.store]);

  useEffect(() => {
    if (state.product.name && state.store && state.products) {
      dispatch({ type: 'set_error', error: undefined });
    }
  }, [state.product.name, state.store, state.products]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <ShoppingCartIcon attribution={route.params.attribution} />
          <View style={{ marginRight: 20 }}>
            {state.product.name && state.product.price && state.store?.phone && (
              <Touchable
                style={{
                  paddingVertical: 5,
                  paddingLeft: 15,
                  paddingRight: 5,
                }}
                onPress={pressSendToWhatsappHandler}
              >
                <Icon name="whatsapp" size={28} color="#55A931" />
              </Touchable>
            )}
          </View>
        </View>
      ),
    });
  }, [state.product.name, state.product.price, state.store?.phone]);

  useFocusEffect(
    useCallback(() => {
      if (state.product.store) {
        const unsubscribe = shoppingCartCache.onChangeStore(
          state.product.store,
          (data) => {
            dispatch({ type: 'set_amount', amount: getAmount(data) });
          }
        );
        return () => {
          unsubscribe();
        };
      }
    }, [state.product.store])
  );

  useEffect(() => {
    let unsubscribe: () => void = noop;
    if (state.store && state.product) {
      unsubscribe = shoppingCartCache.onChangeItem(
        state.store.id,
        state.product.id,
        (data) => {
          dispatch({ type: 'set_product_qty', product_qty: data?.qty || 0 });
        }
      );
    }

    return () => {
      unsubscribe();
    };
  }, [state.store, state.product]);

  useEffect(() => {
    if (!state.store?.opening_hours) {
      dispatch({
        type: 'set_current_opening_hours',
      });
    } else {
      dispatch({
        type: 'set_current_opening_hours',
        current_opening_hours: extractCurrentOpeningHours(
          state.store.opening_hours
        ),
      });
    }
  }, [state.store?.opening_hours]);

  // render logic

  // images
  let images = (
    <View style={{ height: 300, backgroundColor: colors.blackLight8 }} />
  );
  if (state.product.images) {
    images = (
      <Carousell
        images={state.product.images.map((image) =>
          cloudinary.dynamicUrl(image, 'h_500,c_scale,q_auto,f_auto,fl_lossy')
        )}
      />
    );
  }

  // content
  let content: ReactNode = <View />;
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
          No se pudo cargar la información
        </Text>
        <Text level={6} style={{ marginBottom: 10, textAlign: 'center' }}>
          Pero no te desanimes, reintentalo una vez más
        </Text>
        <Button title="Reintentar" type="link" onPress={retryHandler} />
      </View>
    );
  } else if (!state.product.name || !state.store || !state.products) {
    content = (
      <View style={[globalStyles.withMargin, { paddingTop: 20 }]}>
        <Bone width="50%" height={25} style={{ marginBottom: 15 }} />
        <Bone width="100%" height={25} style={{ marginBottom: 7 }} />
        <Bone width="100%" height={25} style={{ marginBottom: 30 }} />
      </View>
    );
  } else {
    content = (
      <View>
        <View style={{ marginVertical: 10 }}>
          <View style={globalStyles.withMargin}>
            <Text level={3} weight="bold" style={{ marginBottom: 5 }}>
              {`${state.product.name} · `}
              <Text level={3} weight="normal">
                {numberFormatter.toCurrency(state.product.price)}
              </Text>
            </Text>
            {!!state.product.description && (
              <View style={{ marginBottom: 5 }}>
                <ReadMore
                  level={6}
                  numberOfLines={3}
                  style={{ lineHeight: 18 }}
                >
                  {state.product.description}
                </ReadMore>
              </View>
            )}
          </View>
          {typeof state.product_qty !== 'undefined' && (
            <View style={{ minHeight: 45, marginTop: 10, marginBottom: 10 }}>
              <NumberInput
                value={state.product_qty}
                style={{ alignSelf: 'center' }}
                onChange={changeProductQtyHandler}
              />
            </View>
          )}
        </View>
        <Divider type="thick" />
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
              uri: cloudinary.dynamicUrl(
                state.store.images[0],
                'w_500,c_scale,q_auto,f_auto,fl_lossy'
              ),
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
            {state.current_opening_hours?.status === 'closed' && (
              <View
                style={{
                  backgroundColor: !state.current_opening_hours.next_open
                    ? colors.black
                    : colors.red2,
                  alignSelf: 'flex-start',
                  borderRadius: 10,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                }}
              >
                <Text
                  level={7}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  weight="bold"
                  color={colors.white}
                >
                  {humanizeCurrentClosedOpeningHours(
                    state.current_opening_hours
                  )}
                </Text>
              </View>
            )}
          </View>
          <Icon name="chevron-right" />
        </Touchable>
        <Divider type="thick" />
        {state.products.hits.length > 0 && (
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
            {state.products.total > state.products.hits.length && (
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
                    uri: cloudinary.dynamicUrl(
                      state.store.images[0],
                      'w_500,c_scale,q_auto,f_auto,fl_lossy'
                    ),
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
                  <Text level={6}>Ver más en tienda</Text>
                </View>
                <Icon name="chevron-right" />
              </Touchable>
            )}
          </View>
        )}
      </View>
    );
  }

  // order button
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
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {images}
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
      {state.whatsapp_not_found_dialog && (
        <InfoDialog
          title="No se pudo abrir Whatsapp"
          message="Verifica que lo tienes instalado 😉"
          onOk={whatsappNotFoundDialogOnOkHandler}
        />
      )}
    </View>
  );
};
