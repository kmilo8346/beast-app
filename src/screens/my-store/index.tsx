import React, { useCallback, useEffect, useReducer } from 'react';
import {
  ActivityIndicator,
  FlatList,
  GestureResponderEvent,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios, { CancelTokenSource } from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// local components
import ProductItem from './components/product-item';
import Skeletton from './components/skeletton';
// components
import Icon from '../../components/icon';
import Text from '../../components/text';
import Image from '../../components/image';
import Divider from '../../components/divider';
import Touchable from '../../components/touchable';
import ErrorView from '../../components/error-view';
import Button from '../../components/buttons/button';
import ActionSheet from '../../components/modals/action-sheet';
import BasketCatImage from '../../components/svgs/images/basket-cat';
import LogoBackgroundWhiteImage from '../../components/svgs/images/bag-logo-background-blue-big';
// clients
import storeClient from '../../clients/store-client';
import productClient from '../../clients/product-client';
// cache
import userCache from '../../cache/user';
import storeCache from '../../cache/store';
// libs
import { capture } from '../../lib/sentry';
import cloudinary from '../../lib/cloudinary';
import {
  CurrentOpenginHours,
  extractCurrentOpeningHours,
} from '../../lib/utils';
// types
import { Product, SearchResponse, Store, User } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[my store screen]';
let fetchStoreRequestSource: CancelTokenSource;
let fetchProductsRequestSource: CancelTokenSource;

type SetUserAction = {
  type: 'set_user';
  user?: User;
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
type SetFetchMoreErrorAction = {
  type: 'set_fetch_more_error';
  fetch_more_error?: Error;
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
type SetStoreMenuAction = {
  type: 'set_store_menu';
  store_menu: boolean;
};
type SetCurrentOpeningHoursAction = {
  type: 'set_current_opening_hours';
  current_opening_hours?: CurrentOpenginHours;
};
type Action =
  | SetUserAction
  | SetStoreAction
  | ResetAction
  | SetProductsAction
  | SetErrorAction
  | SetRefreshingAction
  | SetFetchingMoreAction
  | SetFetchMoreErrorAction
  | AddProductAction
  | UpdateProductAction
  | DeleteProductAction
  | SetStoreMenuAction
  | SetCurrentOpeningHoursAction;
type State = {
  user?: User;
  store?: Store;
  products?: SearchResponse<Product>;
  error?: Error;
  refreshing: boolean;
  fetching_more: boolean;
  fetch_more_error?: Error;
  store_menu: boolean;
  current_opening_hours?: CurrentOpenginHours;
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
    case 'set_fetching_more':
      return { ...state, fetching_more: action.fetching_more };
    case 'set_fetch_more_error':
      return { ...state, fetch_more_error: action.fetch_more_error };
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
    case 'set_store_menu':
      return { ...state, store_menu: action.store_menu };
    case 'set_current_opening_hours':
      return { ...state, current_opening_hours: action.current_opening_hours };
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
    user: userCache.getData(),
    refreshing: false,
    fetching_more: false,
    store_menu: false,
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
        { cancelToken: fetchStoreRequestSource.token }
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
      { cancelToken: fetchProductsRequestSource.token }
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
      dispatch({ type: 'set_fetch_more_error', fetch_more_error: undefined });
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

        dispatch({ type: 'set_fetch_more_error', fetch_more_error: error });
      }
    } finally {
      dispatch({ type: 'set_fetching_more', fetching_more: false });
    }
  };

  const pressCreateStoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    if (!state.user?.first_name) {
      navigation.navigate('AddUserData', {
        redirect: {
          name: 'UpsertStore',
        },
      });
      return;
    }
    navigation.navigate('CreateStoreWizzardSetName');
  };

  const retryHandler = () => {
    boot();
  };

  const retryFetchMoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    fetchMore();
  };

  const pressEditStoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    const store = storeCache.getData();
    navigation.navigate('EditStore', { store });
  };

  const pressAddProductHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('UpsertProduct');
  };

  const pressStartSessionHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('SetPhone', {
      redirect: {
        name: 'MyStore',
      },
    });
  };

  const pressMenuHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({
      type: 'set_store_menu',
      store_menu: true,
    });
  };

  const storeMenuCloseHandler = () => {
    dispatch({
      type: 'set_store_menu',
      store_menu: false,
    });
  };

  const storeMenuCallActionHandler = async (key: string) => {
    dispatch({
      type: 'set_store_menu',
      store_menu: false,
    });

    switch (key) {
      case 'orders':
        setTimeout(() => {
          navigation.navigate('SellerOrders');
        }, 300);
        break;
      default:
        break;
    }
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

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = userCache.onChange((user) => {
        dispatch({ type: 'set_user', user });
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

  useEffect(() => {
    if (!state.store?.opening_hours) {
      dispatch({ type: 'set_current_opening_hours' });
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
  const insets = useSafeAreaInsets();

  if (!state.user?.phone || !state.user?.phone_verified) {
    return (
      <View
        style={[
          {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.white,
          },
          globalStyles.withPadding,
        ]}
      >
        <Text
          level={4}
          weight="bold"
          style={{ marginTop: 25, marginBottom: 10 }}
        >
          Inicia sesión para comenzar
        </Text>
        <Text
          level={5}
          weight="light"
          style={{
            lineHeight: 23,
            textAlign: 'center',
            marginHorizontal: 20,
            marginBottom: 40,
          }}
        >
          Ofrece tus productos y llega a clientes totalmente gratis
        </Text>

        <Button title="Iniciar sesión" onPress={pressStartSessionHandler} />
      </View>
    );
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

  let delivery_area_text = `Radio ${state.store.delivery_area.radius} · `;
  let statusMessage = '';
  let statusColor = '';
  if (state.store.delivery_area.center.route) {
    delivery_area_text = `${delivery_area_text} ${state.store.delivery_area.center.route.short_name}`;
    if (state.store.delivery_area.center.street_number) {
      delivery_area_text = `${delivery_area_text} ${state.store.delivery_area.center.street_number.short_name}`;
    }
  } else if (state.store.delivery_area.center.locality) {
    delivery_area_text = `${delivery_area_text} ${state.store.delivery_area.center.locality.short_name}`;
  } else {
    delivery_area_text = `${delivery_area_text} ${state.store.delivery_area.center.administrative_area_level_3.short_name}`;
  }
  if (state.current_opening_hours) {
    if (state.current_opening_hours.status === 'closed') {
      statusMessage = 'Tienda cerrada';
      statusColor = colors.red2;
    } else {
      statusMessage = 'Tienda abierta';
      statusColor = colors.green3;
    }
    if (!state.store.enabled) {
      statusMessage = 'Tienda no visible';
      statusColor = colors.blackLight1;
    }
  }

  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.white, paddingTop: insets.top },
      ]}
    >
      <View style={globalStyles.screenWithoutHeaderSpace} />

      <FlatList
        data={state.products.hits}
        refreshing={state.refreshing}
        ListHeaderComponent={() => {
          return (
            <>
              <View style={globalStyles.withMargin}>
                <Touchable
                  style={{ alignItems: 'center', marginBottom: 20 }}
                  onPress={pressEditStoreHandler}
                >
                  <Image
                    source={{
                      uri: cloudinary.dynamicUrl(
                        (state.store as Store).images[0],
                        'w_214'
                      ),
                    }}
                    style={{
                      height: 100,
                      width: 100,
                      borderRadius: 100,
                    }}
                  />
                  <Text
                    level={2}
                    weight="bold"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ marginBottom: 10 }}
                  >
                    {(state.store as Store).name}
                  </Text>

                  <Text
                    level={7}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ textAlign: 'center', marginBottom: 10 }}
                  >
                    {delivery_area_text}
                  </Text>

                  {!!state.current_opening_hours && (
                    <View
                      style={{
                        position: 'relative',
                        borderRadius: 3,
                        borderWidth: 3,
                        borderColor: colors.white,

                        shadowColor: '#000',
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.2,
                        shadowRadius: 1.41,

                        elevation: 2,
                      }}
                    >
                      <View
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: -2,
                          flexDirection: 'row',
                          justifyContent: 'space-around',
                          zIndex: 999999,
                          height: 20,
                        }}
                      >
                        <View
                          style={{
                            borderWidth: 1,
                            borderColor: colors.blackLight5,
                            borderRadius: 50,
                            width: 5,
                            height: 5,
                            backgroundColor: colors.blackLight6,
                          }}
                        />
                        <View
                          style={{
                            borderWidth: 1,
                            borderColor: colors.blackLight5,
                            borderRadius: 50,
                            width: 5,
                            height: 5,
                            backgroundColor: colors.blackLight6,
                          }}
                        />
                      </View>
                      <View
                        style={{
                          borderRadius: 3,
                          backgroundColor: statusColor,
                          paddingVertical: 5,
                          paddingHorizontal: 10,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          level={5}
                          weight="bold"
                          color={colors.white}
                          style={{
                            textAlign: 'center',
                          }}
                        >
                          {statusMessage}
                        </Text>
                      </View>
                    </View>
                  )}
                </Touchable>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                  }}
                >
                  <Button
                    title="Configurar tienda"
                    style={{ flex: 1 }}
                    onPress={pressEditStoreHandler}
                  />
                  <View style={{ width: 10 }} />
                  <Touchable
                    style={{
                      justifyContent: 'center',
                      alignSelf: 'stretch',
                      backgroundColor: colors.blackLight6,
                      paddingHorizontal: 20,
                      borderRadius: 10,
                    }}
                    onPress={pressMenuHandler}
                  >
                    <Icon name="more-horizontal" />
                  </Touchable>
                </View>
              </View>

              <Divider style={{ marginTop: 20, marginBottom: 20 }} />

              {!!state.products?.hits.length && (
                <View
                  style={[
                    {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 30,
                    },
                    globalStyles.withMargin,
                  ]}
                >
                  <Text
                    level={4}
                    weight="bold"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ flex: 1 }}
                  >
                    Productos de esta tienda
                  </Text>
                  <Button
                    type="link"
                    title={
                      <Text level={6} weight="bold" color={colors.blue}>
                        Añadir
                      </Text>
                    }
                    style={{
                      paddingRight: 0,
                    }}
                    onPress={pressAddProductHandler}
                  />
                </View>
              )}
            </>
          );
        }}
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
          <View style={{ flex: 1, alignItems: 'center', marginTop: 30 }}>
            <BasketCatImage width={120} height={120} />
            <Text level={6} weight="bold" style={{ marginBottom: 15 }}>
              No tienes productos en tu tienda
            </Text>
            <Button
              type="link"
              title={
                <Text level={6} weight="bold" color={colors.blue}>
                  Añadir
                </Text>
              }
              onPress={pressAddProductHandler}
            />
          </View>
        }
        ListFooterComponent={
          <View
            style={[
              {
                alignItems: 'center',
                height: 60,
              },
              globalStyles.withMargin,
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
        style={[{ flex: 1, paddingTop: 20 }]}
      />
      {state.store_menu && (
        <ActionSheet
          options={[
            {
              key: 'orders',
              text: 'Órdenes de la tienda',
            },
            { key: 'cancel', text: 'Cerrar', icon: 'x', type: 'cancel' },
          ]}
          onRequestClose={storeMenuCloseHandler}
          onCallAction={storeMenuCallActionHandler}
        />
      )}
    </View>
  );
};
