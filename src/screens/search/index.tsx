import React, {
  ReactNode,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  GestureResponderEvent,
  Keyboard,
  TextInput,
  View,
  ScrollView,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios, { CancelTokenSource } from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// local components
import SortAndFiltersModal, {
  mapSort,
  getDefaultSort,
} from './components/sort-and-filters-modal';
// home components
// TODO: move to screen components
import ProductCard from '../home/components/product-card';
// components
import Text from '../../components/text';
import Icon from '../../components/icon';
import Divider from '../../components/divider';
import Touchable from '../../components/touchable';
import Button from '../../components/buttons/button';
import BasketCatImage from '../../components/svgs/images/basket-cat';
// clients
import storeProductClient from '../../clients/store-product-client';
// local cache
import recentSearchesCache from './caches/recent-searches';
// cache
import userCache from '../../cache/user';
// libs
import { capture } from '../../lib/sentry';
// types
import { Place, SearchResponse, StoreProduct, User } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[search screen]';
let fetchRequestSource: CancelTokenSource;

type SetUserAction = {
  type: 'set_user';
  user: User;
};
type SetAddressAction = {
  type: 'set_address';
  address: Place;
};
type SetFocusedAction = {
  type: 'set_focused';
  focused: boolean;
};
type SetQueryAction = {
  type: 'set_query';
  query: string;
};
type SetSortAndFiltersAction = {
  type: 'set_sort_and_filters';
  sort: { title: string; value: { [key: string]: any } };
  filters: { [key: string]: any };
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
type SetLoadedCacheAction = {
  type: 'set_loaded_cache';
  loaded_cache: boolean;
};
type SetRecentSearchesAction = {
  type: 'set_recent_searches';
  recent_searches: string[];
};
type SetModalSortAndFiltersAction = {
  type: 'set_modal_sort_and_filters';
  modal_sort_and_filters: boolean;
};
type SetActiveFiltersAction = {
  type: 'set_active_filters';
  active_filters: number;
};
type Action =
  | SetUserAction
  | SetAddressAction
  | SetFocusedAction
  | SetQueryAction
  | SetSortAndFiltersAction
  | SetLoadingAction
  | SetProductsAction
  | AddProductsAction
  | ResetProductsAction
  | SetErrorAction
  | SetRefreshingAction
  | SetFetchingMoreAction
  | SetFetchMoreErrorAction
  | SetLoadedCacheAction
  | SetRecentSearchesAction
  | SetModalSortAndFiltersAction
  | SetActiveFiltersAction;
type State = {
  user: User;
  address: Place;
  focused: boolean;
  query: string;
  filters: { [key: string]: any };
  sort: { title: string; value: { [key: string]: string } };
  loading: boolean;
  products?: SearchResponse<StoreProduct>;
  error?: Error;
  refreshing: boolean;
  fetching_more: boolean;
  fetch_more_error?: Error;
  loaded_cache: boolean;
  recent_searches: string[];
  modal_sort_and_filters: boolean;
  active_filters: number;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_user':
      return { ...state, user: action.user };
    case 'set_address':
      return { ...state, address: action.address };
    case 'set_focused':
      return { ...state, focused: action.focused };
    case 'set_query':
      return { ...state, query: action.query };
    case 'set_sort_and_filters':
      return { ...state, sort: action.sort, filters: action.filters };
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
        error: undefined,
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
    case 'set_recent_searches':
      return { ...state, recent_searches: action.recent_searches };
    case 'set_loaded_cache':
      return { ...state, loaded_cache: action.loaded_cache };
    case 'set_modal_sort_and_filters':
      return {
        ...state,
        modal_sort_and_filters: action.modal_sort_and_filters,
      };
    case 'set_active_filters':
      return {
        ...state,
        active_filters: action.active_filters,
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
  const [state, dispatch] = useReducer(
    reducer,
    (() => {
      const address = userCache.getAddress() as Place;
      const defaultSort = getDefaultSort();
      return {
        address,
        user: userCache.getData() as User,
        focused: false,
        query: '',
        filters: Object.assign(
          {},
          {
            enabled: true,
            store_enabled: true,
            location: address.location,
          },
          route.params?.filters
        ),
        sort: route.params?.sort
          ? mapSort(route.params.sort, defaultSort)
          : defaultSort,
        loading: false,
        refreshing: false,
        fetching_more: false,
        loaded_cache: false,
        recent_searches: [],
        modal_sort_and_filters: false,
        active_filters: 0,
      };
    })()
  );

  // event handlers
  const fetch = async (
    query: string,
    filters: { [key: string]: any },
    sort: { [key: string]: any },
    from: number,
    size: number
  ) => {
    fetchRequestSource && fetchRequestSource.cancel();
    fetchRequestSource = axios.CancelToken.source();
    const response = await storeProductClient.search(
      {
        sort,
        from,
        size,
        query,
        filters,
        source: [
          'id',
          'name',
          'price',
          'store',
          'images',
          'store_info.name',
          'store_info.images',
        ],
      },
      { cancelToken: fetchRequestSource.token }
    );
    return response;
  };

  const load = async () => {
    try {
      dispatch({ type: 'reset_products' });
      const response = await fetch(
        state.query,
        state.filters,
        state.sort.value,
        0,
        10
      );
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
      const response = await fetch(
        state.query,
        state.filters,
        state.sort.value,
        0,
        10
      );
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
      const response = await fetch(
        state.query,
        state.filters,
        state.sort.value,
        state.products.from,
        state.products.size
      );
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

  const loadCache = async () => {
    await recentSearchesCache.load();
    dispatch({ type: 'set_loaded_cache', loaded_cache: true });
  };

  const pressBackHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.goBack();
  };

  const focusSearchHandler = () => {
    dispatch({ type: 'set_focused', focused: true });
  };

  const changeTextSearchHandler = (query: string) => {
    dispatch({ type: 'set_query', query });
  };

  const pressCancelSearchHandler = () => {
    dispatch({ type: 'set_query', query: '' });
    dispatch({ type: 'set_focused', focused: false });
    Keyboard.dismiss();
  };

  const submitSearchHandler = (
    event: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => {
    dispatch({ type: 'set_focused', focused: false });
    // save recent searches
    if (event.nativeEvent.text) {
      recentSearchesCache.add(event.nativeEvent.text);
    }
  };

  const pressSearchHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_focused', focused: false });
    Keyboard.dismiss();
    // save recent searches
    if (state.query) {
      recentSearchesCache.add(state.query);
    }
  };

  const retryHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    load();
  };

  const pressProductHandler = (product: StoreProduct) => {
    navigation.navigate('Product', { product });
  };

  const retryFetchMoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    fetchMore();
  };

  const pressSortAndFiltersHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({
      type: 'set_modal_sort_and_filters',
      modal_sort_and_filters: true,
    });
  };

  const changeModalSortAndFiltersHandler = (
    sort: { title: string; value: { [key: string]: any } },
    filters: { [key: string]: any }
  ) => {
    dispatch({ type: 'set_sort_and_filters', sort, filters });
    dispatch({
      type: 'set_modal_sort_and_filters',
      modal_sort_and_filters: false,
    });
  };

  const closeModalSortAndFiltersHandler = () => {
    dispatch({
      type: 'set_modal_sort_and_filters',
      modal_sort_and_filters: false,
    });
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = userCache.onChange((user) => {
        dispatch({ type: 'set_user', user: user as User });
      });
      return () => {
        unsubscribe();
      };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      dispatch({
        type: 'set_address',
        address: userCache.getAddress() as Place,
      });
    }, [state.user.current_address])
  );

  useEffect(() => {
    if (!state.focused) {
      load();
    }
  }, [state.focused, state.query, state.sort, state.filters]);

  useEffect(() => {
    loadCache();

    return () => {
      fetchRequestSource && fetchRequestSource.cancel();
    };
  }, []);

  useEffect(() => {
    if (!state.loaded_cache) {
      return;
    }
    const unsubscribe = recentSearchesCache.onChange((data) => {
      dispatch({
        type: 'set_recent_searches',
        recent_searches: data?.searches || [],
      });
    });

    return () => {
      fetchRequestSource && fetchRequestSource.cancel();
      unsubscribe();
    };
  }, [state.loaded_cache]);

  useEffect(() => {
    let active = 0;
    if (state.filters.store_address) {
      active++;
    }
    if (state.filters.store_open) {
      active++;
    }
    dispatch({ type: 'set_active_filters', active_filters: active });
  }, [state.filters]);

  // render logic
  const ref = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  let content: ReactNode;
  if (state.focused) {
    content = (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={[{ flex: 1, paddingTop: 10 }, globalStyles.withPadding]}
      >
        {!!state.query && (
          <View style={{ marginBottom: 10 }}>
            <Touchable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingBottom: 5,
              }}
              onPress={pressSearchHandler}
            >
              <View
                style={{
                  backgroundColor: colors.blackLight9,
                  borderRadius: 100,
                  width: 40,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon name="search" size={18} />
              </View>
              <Text level={7} style={{ marginLeft: 10 }}>
                {`Buscar "${state.query}"`}
              </Text>
            </Touchable>
            <Divider />
          </View>
        )}

        {!!state.recent_searches.length && (
          <View>
            <Text level={6} weight="bold" style={{ marginBottom: 15 }}>
              Recientes
            </Text>
            {state.recent_searches.map((text, index) => (
              <View
                key={`${index}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Touchable
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={(event: GestureResponderEvent) => {
                    event.stopPropagation();
                    dispatch({ type: 'set_query', query: text });
                    dispatch({ type: 'set_focused', focused: false });
                    Keyboard.dismiss();
                    // save recent searches
                    if (text) {
                      recentSearchesCache.add(text);
                    }
                  }}
                >
                  <View
                    style={{
                      backgroundColor: colors.blackLight9,
                      borderRadius: 100,
                      width: 40,
                      height: 40,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Icon name="search" size={18} />
                  </View>
                  <Text level={7} style={{ marginLeft: 10 }}>
                    {text}
                  </Text>
                </Touchable>
                <Touchable
                  style={{
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={(event: GestureResponderEvent) => {
                    event.stopPropagation();
                    recentSearchesCache.delete(text);
                  }}
                >
                  <Icon name="x" size={16} />
                </Touchable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  } else if (state.error) {
    content = (
      <View
        style={[
          { flex: 1, justifyContent: 'center', alignItems: 'center' },
          globalStyles.withMargin,
        ]}
      >
        <Text level={6} weight="bold" style={{ marginBottom: 15 }}>
          No se pudo cargar los productos
        </Text>
        <Text level={6} style={{ marginBottom: 10, textAlign: 'center' }}>
          Pero no te desanimes, reintentalo una vez más
        </Text>
        <Button title="Reintentar" type="link" onPress={retryHandler} />
      </View>
    );
  } else if (!state.products) {
    content = (
      <View
        style={[
          { flex: 1, justifyContent: 'center', alignItems: 'center' },
          globalStyles.withMargin,
        ]}
      >
        <ActivityIndicator size="small" color={colors.black} />
      </View>
    );
  } else {
    content = (
      <View style={{ flex: 1 }}>
        <FlatList
          numColumns={2}
          ListHeaderComponent={
            <View>
              {!!state.products.hits.length && (
                <Text
                  level={6}
                  weight="bold"
                  style={{ flex: 1, marginBottom: 15 }}
                >
                  {`Ordenados por ${state.sort.title}`}
                </Text>
              )}
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
          ListEmptyComponent={() => {
            if (state.query && !state.products?.hits.length) {
              return (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 200,
                  }}
                >
                  <Text level={6} weight="bold" style={{ marginBottom: 15 }}>
                    No se encontraron productos
                  </Text>
                  <Text
                    level={6}
                    style={{
                      marginBottom: 10,
                      textAlign: 'center',
                      lineHeight: 23,
                    }}
                  >
                    Revisa la octografía o prueba con otra búsqueda
                  </Text>
                </View>
              );
            }
            return (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 100,
                }}
              >
                <BasketCatImage />
                <Text level={6} weight="bold" style={{ marginBottom: 15 }}>
                  No existen productos
                </Text>
                <Text
                  level={6}
                  style={{
                    marginBottom: 10,
                    textAlign: 'center',
                    lineHeight: 23,
                  }}
                >
                  Puede ser una oportunidad para venderlos tu 😀
                </Text>
              </View>
            );
          }}
          data={state.products.hits}
          keyboardDismissMode="on-drag"
          refreshing={state.refreshing}
          renderItem={({ item, index }) => {
            return (
              <ProductCard
                key={`${item.id}`}
                product={item}
                align={index % 2 === 0 ? 'left' : 'right'}
                onPress={pressProductHandler}
              />
            );
          }}
          keyExtractor={(item: StoreProduct) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          style={[{ flex: 1, paddingTop: 15 }, globalStyles.withPadding]}
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
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
        >
          <Touchable
            style={{
              borderRadius: 30,
              paddingHorizontal: 15,
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.white,
              marginBottom: 15,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,

              elevation: 3,
            }}
            onPress={pressSortAndFiltersHandler}
          >
            <Icon name="filter" size={18} />
            <Text level={6} weight="bold" style={{ marginLeft: 5 }}>
              Ordenar y filtrar
              {state.active_filters > 0 ? (
                <Text
                  level={6}
                  weight="bold"
                  color={colors.blackLight2}
                >{`  ${state.active_filters}`}</Text>
              ) : (
                ''
              )}
            </Text>
          </Touchable>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.white, paddingTop: insets.top }}
    >
      <View
        style={[
          { flexDirection: 'row', alignItems: 'center', paddingBottom: 5 },
          Platform.select({
            ios: {
              paddingTop: 3,
            },
            android: {
              paddingTop: 10,
            },
          }),
          globalStyles.withMargin,
        ]}
      >
        <Touchable
          style={{ paddingLeft: 2, paddingRight: 15, paddingVertical: 5 }}
          onPress={pressBackHandler}
        >
          <Icon name="chevron-left" />
        </Touchable>
        <View
          style={[
            {
              flex: 1,
              flexDirection: 'row',
            },
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
            autoCorrect={false}
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
            onFocus={focusSearchHandler}
            onChangeText={changeTextSearchHandler}
            onSubmitEditing={submitSearchHandler}
          />
          {state.focused && (
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
          )}
        </View>
      </View>
      {content}
      {state.modal_sort_and_filters && (
        <SortAndFiltersModal
          sort={state.sort}
          filters={state.filters}
          address={state.address}
          onChange={changeModalSortAndFiltersHandler}
          onClose={closeModalSortAndFiltersHandler}
        />
      )}
    </View>
  );
};
