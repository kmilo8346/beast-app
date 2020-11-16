import React, {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
} from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  Dimensions,
  GestureResponderEvent,
  FlatList,
} from 'react-native';
import axios, { CancelTokenSource } from 'axios';
import { useFocusEffect } from '@react-navigation/native';

// components
import Text from '../../components/text';
import Divider from '../../components/divider';
import Touchable from '../../components/touchable';
import Icon from '../../components/icon';
import Button from '../../components/buttons/button';
import PhoneFilledDotsBlueIcon from '../../components/svgs/icons/phone-filled-dots-blue';
import ActionSheetContact from '../../components/modals/action-sheet-contact';
import HeartBlueIcon from '../../components/svgs/icons/heart-blue';
// screen components
import ProductCard from '../components/product-card';
import ShoppingCartIcon from '../components/shopping-cart-icon';
// local components
import ViewOpeningHoursModal from './components/view-opening-hours-modal';
// clients
import productClient from '../../clients/product-client';
// cache
import shoppingCartCache, { getAmount } from '../../cache/shopping-cart';
// libs
import durationFormatter from '../../lib/formatters/duration-formatter';
import numberFormatter from '../../lib/formatters/number-formatter';
import cloudinary from '../../lib/cloudinary';
import { capture } from '../../lib/sentry';
import * as utils from '../../lib/utils';
// types
import { Product, SearchResponse, Store } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[store screen]';
let fetchRequestSource: CancelTokenSource;
const defaultSize = 10;

type ResetAction = {
  type: 'reset';
};
type SetProductsAction = {
  type: 'set_products';
  products: SearchResponse<Product>;
};
type SetErrorAction = {
  type: 'set_error';
  error: Error;
};
type SetContactAction = {
  type: 'set_contact';
  contact: boolean;
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
type Action =
  | ResetAction
  | SetProductsAction
  | SetErrorAction
  | SetContactAction
  | SetFetchingMoreAction
  | SetFetchMoreErrorAction
  | SetRefreshingAction
  | SetRefreshingAction
  | SetAmountAction
  | SetOpeningHoursModalAction
  | TooggleExpandedAction;
type State = {
  products?: SearchResponse<Product>;
  error?: Error;
  contact: boolean;
  fetching_more: boolean;
  fetch_more_error?: Error;
  refreshing: boolean;
  amount?: number;
  opening_hours_modal: boolean;
  expanded: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'reset':
      return {
        ...state,
        products: undefined,
        error: undefined,
      };
    case 'set_products':
      return { ...state, products: action.products };
    case 'set_error':
      return { ...state, error: action.error };
    case 'set_contact':
      return { ...state, contact: action.contact };
    case 'set_fetching_more':
      return { ...state, fetching_more: action.fetching_more };
    case 'set_fetch_more_error':
      return { ...state, fetch_more_error: action.fetch_more_error };
    case 'set_refreshing':
      return { ...state, refreshing: action.refreshing };
    case 'set_amount':
      return { ...state, amount: action.amount };
    case 'set_opening_hours_modal':
      return { ...state, opening_hours_modal: action.opening_hours_modal };
    case 'toogle_expanded':
      return { ...state, expanded: !state.expanded };
    default:
      return state;
  }
};

interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  const store: Store = route.params.store;
  if (!store) {
    throw new Error(`${prefix} Store param is required`);
  }
  // state
  const [state, dispatch] = useReducer(reducer, {
    contact: false,
    fetching_more: false,
    refreshing: false,
    opening_hours_modal: false,
    expanded: false,
  });

  // event handlers
  const fetch = async (
    filters?: { [key: string]: any },
    from = 0,
    size = defaultSize
  ) => {
    if (fetchRequestSource) {
      fetchRequestSource.cancel();
    }
    fetchRequestSource = axios.CancelToken.source();
    const products = await productClient.search(
      {
        pathVars: {
          storeId: store.id,
        },
        filters,
        from,
        size,
      },
      { cancelToken: fetchRequestSource.token }
    );
    return products;
  };

  const load = async () => {
    try {
      dispatch({ type: 'reset' });
      const response = await fetch({ enabled: true });
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

  const refresh = async () => {
    try {
      dispatch({ type: 'set_refreshing', refreshing: true });
      const response = await fetch({
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
      dispatch({ type: 'set_fetch_more_error', fetch_more_error: undefined });
      dispatch({ type: 'set_fetching_more', fetching_more: true });
      const products = await fetch(
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

  const pressContactStoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_contact', contact: true });
  };

  const contactStoreCloseHandler = () => {
    dispatch({ type: 'set_contact', contact: false });
  };

  const retryHandler = () => {
    load();
  };

  const retryFetchMoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    fetchMore();
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

  const pressDescriptionHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'toogle_expanded' });
  };

  useEffect(() => {
    load();
  }, [store]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <ShoppingCartIcon style={{ marginRight: 20 }} />,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = shoppingCartCache.onChangeStore(store.id, (data) => {
        dispatch({ type: 'set_amount', amount: getAmount(data) });
      });
      return () => {
        unsubscribe();
      };
    }, [])
  );

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
          Ocurrió un error inesperado
        </Text>
        <Text level={6} style={{ marginBottom: 10 }}>
          El error fue registrado para su solución
        </Text>
        <Button title="Reintentar" type="link" onPress={retryHandler} />
      </View>
    );
  }
  if (state.products) {
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
  const openInfo = utils.humanizeOpenInfo(store.opening_hours);
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <FlatList
        data={state.products?.hits || []}
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
                  uri: cloudinary.dynamicUrl(store.images[0], 'h_500'),
                }}
                style={{
                  width: Dimensions.get('window').width - 40,
                  height: 200,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}
              />
              <View style={{ padding: 15 }}>
                <Text
                  level={4}
                  weight="bold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ flex: 1 }}
                >
                  {store.name}
                </Text>
                {!!store.description && (
                  <>
                    <Touchable
                      style={{
                        marginTop: 5,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                      onPress={pressDescriptionHandler}
                    >
                      <Text level={6} weight="normal">
                        Descripción
                      </Text>
                      {state.expanded ? (
                        <Icon name="chevron-up" />
                      ) : (
                        <Icon name="chevron-down" />
                      )}
                    </Touchable>
                    {state.expanded && (
                      <View style={{ marginHorizontal: 10, marginBottom: 10 }}>
                        <Text level={7}>{store.description}</Text>
                      </View>
                    )}
                  </>
                )}

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
                      store.delivery_time.gte,
                      store.delivery_time.lte
                    )}
                  </Text>
                </View>
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
                    style={{
                      marginLeft: 10,
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      level={7}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      color={openInfo.open ? colors.black : colors.red}
                      style={{ flex: 1 }}
                    >
                      {openInfo.message}
                    </Text>
                    {state.opening_hours_modal ? (
                      <Icon name="chevron-up" />
                    ) : (
                      <Icon name="chevron-down" />
                    )}
                  </View>
                </Touchable>

                <Touchable
                  style={{
                    backgroundColor: colors.blueLight3,
                    borderWidth: 1,
                    borderColor: colors.blueLight5,
                    borderRadius: 13,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={pressContactStoreHandler}
                >
                  <PhoneFilledDotsBlueIcon />
                  <Text
                    level={5}
                    weight="bold"
                    color={colors.blue}
                    style={{ marginLeft: 15 }}
                  >
                    Contactar al vendedor
                  </Text>
                </Touchable>
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
              store={store}
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
          if (state.products && state.products.from < state.products.total) {
            fetchMore();
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
      {state.contact && (
        <ActionSheetContact
          phone={store.phone}
          onRequestClose={contactStoreCloseHandler}
        />
      )}
      {state.opening_hours_modal && (
        <ViewOpeningHoursModal
          value={store.opening_hours}
          onClose={closeOpeningHoursModal}
        />
      )}
    </View>
  );
};
