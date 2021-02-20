import React, {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
} from 'react';
import {
  View,
  ActivityIndicator,
  GestureResponderEvent,
  FlatList,
} from 'react-native';
import axios, { CancelTokenSource } from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import * as Linking from 'expo-linking';

// local components
import ViewOpeningHoursModal from './components/view-opening-hours-modal';
// screen components
import ProductCard from '../components/product-card';
import InfoDialog from '../components/dialogs/info-dialog';
import ShoppingCartIcon from '../components/shopping-cart-icon';
// components
import Text from '../../components/text';
import Icon from '../../components/icon';
import Image from '../../components/image';
import Divider from '../../components/divider';
import Touchable from '../../components/touchable';
import Button from '../../components/buttons/button';
import ReadMore from '../../components/text/read-more';
import HeartBlueIcon from '../../components/svgs/icons/heart-blue';
// clients
import storeClient from '../../clients/store-client';
import productClient from '../../clients/product-client';
// cache
import shoppingCartCache, { getAmount } from '../../cache/shopping-cart';
// libs
import durationFormatter from '../../lib/formatters/duration-formatter';
import numberFormatter from '../../lib/formatters/number-formatter';
import cloudinary from '../../lib/cloudinary';
import { capture } from '../../lib/sentry';
import {
  CurrentOpenginHours,
  extractCurrentOpeningHours,
  humanizeCurrentClosedOpeningHours,
} from '../../lib/utils';
// types
import { Product, SearchResponse, Store } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[store screen]';
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
type SetFetchingMoreAction = {
  type: 'set_fetching_more';
  fetching_more: boolean;
};
type SetFetchMoreErrorAction = {
  type: 'set_fetch_more_error';
  fetch_more_error?: Error;
};
type SetRefreshingAction = {
  type: 'set_refreshing';
  refreshing: boolean;
};
type SetContactAction = {
  type: 'set_contact';
  contact: boolean;
};
type SetAmountAction = {
  type: 'set_amount';
  amount: number;
};
type SetOpeningHoursModalAction = {
  type: 'set_opening_hours_modal';
  opening_hours_modal: boolean;
};
type TooggleExpandedAction = {
  type: 'toogle_expanded';
};
type SetCurrentOpeningHoursAction = {
  type: 'set_current_opening_hours';
  current_opening_hours?: CurrentOpenginHours;
};
type SetWhatsappNotFoundDialogAction = {
  type: 'set_whatsapp_not_found_dialog';
  whatsapp_not_found_dialog: boolean;
};
type Action =
  | ResetAction
  | SetStoreAction
  | SetProductsAction
  | SetErrorAction
  | SetFetchingMoreAction
  | SetFetchMoreErrorAction
  | SetRefreshingAction
  | SetAmountAction
  | SetOpeningHoursModalAction
  | TooggleExpandedAction
  | SetCurrentOpeningHoursAction
  | SetWhatsappNotFoundDialogAction;
type State = {
  store: Store;
  products?: SearchResponse<Product>;
  error?: Error;
  fetching_more: boolean;
  fetch_more_error?: Error;
  refreshing: boolean;
  amount?: number;
  opening_hours_modal: boolean;
  current_opening_hours?: CurrentOpenginHours;
  whatsapp_not_found_dialog: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'reset':
      return {
        ...state,
        products: undefined,
        error: undefined,
      };
    case 'set_store':
      return { ...state, store: action.store };
    case 'set_products':
      return { ...state, products: action.products };
    case 'set_error':
      return { ...state, error: action.error };
    case 'set_fetching_more':
      return {
        ...state,
        fetching_more: action.fetching_more,
        fetch_more_error: undefined,
      };
    case 'set_fetch_more_error':
      return { ...state, fetch_more_error: action.fetch_more_error };
    case 'set_refreshing':
      return { ...state, refreshing: action.refreshing };
    case 'set_amount':
      return { ...state, amount: action.amount };
    case 'set_opening_hours_modal':
      return { ...state, opening_hours_modal: action.opening_hours_modal };
    case 'set_current_opening_hours':
      return { ...state, current_opening_hours: action.current_opening_hours };
    case 'set_whatsapp_not_found_dialog':
      return {
        ...state,
        whatsapp_not_found_dialog: action.whatsapp_not_found_dialog,
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
    store: route.params.store,
    fetching_more: false,
    refreshing: false,
    opening_hours_modal: false,
    whatsapp_not_found_dialog: false,
  });

  // event handlers
  const fetchStore = async () => {
    if (fetchStoreRequestSource) {
      fetchStoreRequestSource.cancel();
    }
    fetchStoreRequestSource = axios.CancelToken.source();
    const store = await storeClient.get(
      {
        pathVars: {
          id: state.store.id,
        },
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

  const fetchProducts = async (
    filters?: { [key: string]: any },
    from = 0,
    size = defaultSize
  ) => {
    if (fetchProductsRequestSource) {
      fetchProductsRequestSource.cancel();
    }
    fetchProductsRequestSource = axios.CancelToken.source();
    const products = await productClient.search(
      {
        pathVars: {
          storeId: state.store.id,
        },
        filters,
        from,
        size,
      },
      { cancelToken: fetchProductsRequestSource.token }
    );
    return products;
  };

  const loadProducts = async () => {
    try {
      const response = await fetchProducts({ enabled: true });
      dispatch({
        type: 'set_products',
        products: {
          ...response,
          from: response.from + response.hits.length,
        },
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Load products error', error);

        dispatch({ type: 'set_error', error });
      }
    }
  };

  const refreshProducts = async () => {
    try {
      const response = await fetchProducts({
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
        capture(prefix, 'Refresh products error', error);
      }
    }
  };

  const load = () => {
    dispatch({ type: 'reset' });
    Promise.all([loadStore(), loadProducts()]);
  };

  const refresh = () => {
    dispatch({ type: 'set_refreshing', refreshing: true });
    Promise.all([refreshStore(), refreshProducts()]);
    dispatch({ type: 'set_refreshing', refreshing: false });
  };

  const fetchMoreProducts = async () => {
    if (!state.products) {
      throw new Error(`${prefix} To fetch more must be state products`);
    }
    try {
      dispatch({ type: 'set_fetching_more', fetching_more: true });
      const products = await fetchProducts(
        state.products.filters,
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
    fetchMoreProducts();
  };

  const pressProductHandler = useCallback((product: Product) => {
    navigation.push('Product', { product });
  }, []);

  const pressMyOrderHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('ShoppingCartStack');
  };

  const pressOpeningHourHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_opening_hours_modal', opening_hours_modal: true });
  };

  const closeOpeningHoursModal = () => {
    dispatch({ type: 'set_opening_hours_modal', opening_hours_modal: false });
  };

  const whatsappNotFoundDialogOnOkHandler = () => {
    dispatch({
      type: 'set_whatsapp_not_found_dialog',
      whatsapp_not_found_dialog: false,
    });
  };

  const pressSendToWhatsappHandler = async (event: GestureResponderEvent) => {
    event.stopPropagation();
    try {
      await Linking.openURL(
        `whatsapp://send?text=${encodeURIComponent(
          `Hola ${state.store.name} 👋`
        )}&phone=${state.store.phone}`
      );
    } catch (error) {
      capture(prefix, 'Press ask me a question error', error);

      dispatch({
        type: 'set_whatsapp_not_found_dialog',
        whatsapp_not_found_dialog: true,
      });
    }
  };

  useEffect(() => {
    return () => {
      fetchStoreRequestSource && fetchStoreRequestSource.cancel();
      fetchProductsRequestSource && fetchProductsRequestSource.cancel();
    };
  }, []);

  useEffect(() => {
    load();
  }, [route.params.store]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <ShoppingCartIcon style={{ marginRight: 20 }} />,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = shoppingCartCache.onChangeStore(
        route.params.store.id,
        (data) => {
          dispatch({ type: 'set_amount', amount: getAmount(data) });
        }
      );
      return () => {
        unsubscribe();
      };
    }, [route.params.store])
  );

  useEffect(() => {
    if (!state.store.opening_hours) {
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
  }, [state.store.opening_hours]);

  // render logic
  let content: ReactNode = (
    <ActivityIndicator
      size="small"
      color={colors.black}
      style={{ alignSelf: 'center', marginTop: 40 }}
    />
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
          No se pudo cargar la información
        </Text>
        <Text level={6} style={{ marginBottom: 10, textAlign: 'center' }}>
          Pero no te desanimes, reintentalo una vez más
        </Text>
        <Button title="Reintentar" type="link" onPress={retryHandler} />
      </View>
    );
  } else if (state.products) {
    if (!state.products.hits.length) {
      content = (
        <View style={{ alignItems: 'center' }}>
          <Text
            level={6}
            weight="bold"
            style={{ marginTop: 40, marginBottom: 15 }}
          >
            Muy pronto
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text level={6} style={{ marginRight: 5 }}>
              Agregaremos productos.
            </Text>
            <HeartBlueIcon />
          </View>
        </View>
      );
    } else {
      content = (
        <View style={[{ paddingTop: 15 }, globalStyles.withMargin]}>
          <Text
            level={4}
            weight="bold"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ marginBottom: 15 }}
          >
            Productos de esta tienda
          </Text>
        </View>
      );
    }
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

  let currentOpeningHoursMessage = '';
  if (state.current_opening_hours) {
    if (state.current_opening_hours.status === 'closed') {
      currentOpeningHoursMessage = humanizeCurrentClosedOpeningHours(
        state.current_opening_hours
      );
    } else {
      currentOpeningHoursMessage = `Horario de atención`;
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={state.error ? undefined : state.products?.hits}
        numColumns={2}
        refreshing={false}
        ListHeaderComponent={
          <View style={{ flex: 1, backgroundColor: colors.white }}>
            <View
              style={[
                {
                  borderRadius: 20,
                  paddingTop: 7,
                },
                globalStyles.withMargin,
              ]}
            >
              <Image
                source={{
                  uri: cloudinary.dynamicUrl(
                    state.store.images[0],
                    'h_500/q_80'
                  ),
                }}
                style={{
                  alignSelf: 'center',
                  height: 150,
                  width: 150,
                  borderRadius: 100,
                }}
              />
              <View style={{ padding: 15 }}>
                <Text
                  level={3}
                  weight="bold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ flex: 1 }}
                >
                  {state.store.name}
                </Text>
                {!!state.store.description && (
                  <View style={{ marginTop: 5 }}>
                    <ReadMore
                      level={6}
                      numberOfLines={3}
                      style={{ lineHeight: 18 }}
                    >
                      {state.store.description}
                    </ReadMore>
                  </View>
                )}

                {!!state.store.delivery_time && (
                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 3,
                    }}
                  >
                    <Icon name="clock" size={18} />
                    <Text
                      level={7}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{ flex: 1, marginLeft: 10 }}
                    >
                      {durationFormatter.humanizeDurationRange(
                        state.store.delivery_time.gte,
                        state.store.delivery_time.lte
                      )}
                    </Text>
                  </View>
                )}

                {!!state.current_opening_hours && (
                  <Touchable
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 15,
                    }}
                    onPress={pressOpeningHourHandler}
                  >
                    <Icon name="calendar" size={18} />
                    <View
                      style={{ flex: 1, marginLeft: 10, flexDirection: 'row' }}
                    >
                      {state.current_opening_hours.status === 'closed' ? (
                        <View
                          style={{
                            backgroundColor: !state.current_opening_hours
                              .next_open
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
                            weight="bold"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={{
                              color: colors.white,
                            }}
                          >
                            {currentOpeningHoursMessage}
                          </Text>
                        </View>
                      ) : (
                        <Text level={7} numberOfLines={1} ellipsizeMode="tail">
                          {currentOpeningHoursMessage}
                        </Text>
                      )}
                    </View>

                    {state.opening_hours_modal ? (
                      <Icon name="chevron-up" />
                    ) : (
                      <Icon name="chevron-down" />
                    )}
                  </Touchable>
                )}

                {!!state.store.phone && (
                  <Button
                    title={
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <Icon name="whatsapp" size={20} color="#55A931" />
                        <Text
                          level={6}
                          color={colors.blue}
                          weight="bold"
                          style={{ marginLeft: 5 }}
                        >
                          Hazme una pregunta
                        </Text>
                      </View>
                    }
                    type="link"
                    style={{ marginTop: 5, marginBottom: 7 }}
                    onPress={pressSendToWhatsappHandler}
                  />
                )}
              </View>
            </View>
            <Divider type="thick" />
            {content}
          </View>
        }
        keyExtractor={(item: Product) => item.id}
        renderItem={({ item, index }) => {
          return (
            <ProductCard
              key={`${item.id}`}
              store={state.store}
              product={item}
              align={index % 2 === 0 ? 'left' : 'right'}
              onPress={pressProductHandler}
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
        onRefresh={refresh}
        onEndReached={() => {
          if (
            !state.fetching_more &&
            state.products &&
            state.products.from < state.products.total
          ) {
            fetchMoreProducts();
          }
        }}
        style={[{ flex: 1 }]}
        columnWrapperStyle={globalStyles.withPadding}
      />
      <View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
          globalStyles.withMargin,
        ]}
      >
        {orderButton}
      </View>

      {state.opening_hours_modal && (
        <ViewOpeningHoursModal
          openingHours={state.store.opening_hours}
          onClose={closeOpeningHoursModal}
        />
      )}
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
