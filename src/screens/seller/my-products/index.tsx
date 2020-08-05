import React, { useReducer, useEffect, useLayoutEffect, useRef } from 'react';
import { View, Keyboard, TouchableWithoutFeedback } from 'react-native';
import axios, { CancelTokenSource } from 'axios';

// components
import {
  FlatList,
  Loading,
  ErrorView,
  NotSearchResult,
  Button,
  IToast,
  Toast,
} from '../../../components';
// seller components
import { Shortcut } from '../components';
// local components
import { ProductItem, Search, NotData } from './components';
// clients
import productClient from '../../../clients/product-client';
// containers
import UserProvider from '../../../containers/user';
// libs
import useDebounce from '../../../lib/hooks/use-debounce';
// types
import { Product, SearchResponse, Service } from '../../../types';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

const addProductImage = require('../../../../assets/icons/plus.png');

// instances outside component
const prefix = '[my products component]';
let fetchRequestSource: CancelTokenSource;
const defaultSize = 10;
type MyProductsView = 'LOADING' | 'DATA' | 'ERROR';
type ChangeQueryAction = {
  type: 'change_query';
  query: string;
};
type ChangeViewAction = {
  type: 'change_view';
  view: MyProductsView;
};
type SetResponseAction = {
  type: 'set_response';
  response: SearchResponse<Product | Service>;
};
type ToogleEdittingAction = {
  type: 'toogle_editting';
};
type CreateProductAction = {
  type: 'create_product';
  product: Product | Service;
};
type UpdateProductAction = {
  type: 'update_product';
  product: Product | Service;
};
type DeleteProductAction = {
  type: 'delete_product';
  product: Product | Service;
};
type SetFetchingMoreAction = {
  type: 'set_fetching_more';
  fetchingMore: boolean;
};
type Action =
  | ChangeQueryAction
  | ChangeViewAction
  | SetResponseAction
  | ToogleEdittingAction
  | CreateProductAction
  | UpdateProductAction
  | DeleteProductAction
  | SetFetchingMoreAction;
type State = {
  view: MyProductsView;
  editting: boolean;
  fetchingMore: boolean;

  query: string;
  from: number;
  size: number;
  total: number;
  hits: (Product | Service)[];
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_query':
      return { ...state, query: action.query, from: 0 };
    case 'change_view':
      return { ...state, view: action.view };
    case 'set_response':
      return {
        ...state,
        view: 'DATA',
        from: action.response.from + action.response.hits.length,
        total: action.response.total,
        size: action.response.size,
        hits: [...state.hits, ...action.response.hits] as (Product | Service)[],
      };
    case 'toogle_editting':
      return { ...state, editting: !state.editting };
    case 'create_product':
      return {
        ...state,
        hits: [action.product, ...state.hits],
      };
    case 'update_product':
      return {
        ...state,
        hits: state.hits.map((hit) => {
          if (hit.id === action.product.id) {
            return { ...action.product };
          }
          return hit;
        }),
      };
    case 'delete_product':
      return {
        ...state,
        hits: state.hits.filter((hit) => hit.id !== action.product.id),
      };
    case 'set_fetching_more':
      return { ...state, fetchingMore: action.fetchingMore };
    default:
      return state;
  }
};

export interface MyProductsProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: MyProductsProps) => {
  // state
  const type = route.params.type;
  const [state, dispatch] = useReducer(reducer, {
    view: 'LOADING',
    editting: false,
    fetchingMore: false,

    query: '',
    from: 0,
    size: defaultSize,
    total: 0,
    hits: [],
  });
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();
  // preconditions
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const store = user.store;
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }
  if (type !== 'product' && type !== 'service') {
    throw new Error(`${prefix} Invalid product type, invalid type: ${type}`);
  }
  const debouncedQuery = useDebounce(state.query, 200);
  const toastRef = useRef<IToast>(null);

  // event handlers
  const fetchProducts = async (query = '', from = 0, size = defaultSize) => {
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
        filters: {
          type,
        },
        from,
        size,
        sort: [{ field: 'updated_at', order: 'desc' }],
      },
      fetchRequestSource.token
    );
    return response;
  };
  const loadProducts = async (query: string) => {
    try {
      dispatch({ type: 'change_view', view: 'LOADING' });
      const response = await fetchProducts(query);
      dispatch({ type: 'set_response', response });
    } catch (error) {
      if (!axios.isCancel(error)) {
        // TODO: Log error
        console.log(error);

        dispatch({ type: 'change_view', view: 'ERROR' });
      }
    }
  };
  const fetchMoreProducts = async () => {
    try {
      console.log('fecthing more products');
      dispatch({ type: 'set_fetching_more', fetchingMore: true });
      const response = await fetchProducts(state.query, state.from, state.size);
      dispatch({ type: 'set_response', response });
    } catch (error) {
      if (!axios.isCancel(error)) {
        // TODO: Log error
        console.log(error);

        dispatch({ type: 'change_view', view: 'ERROR' });
      }
    } finally {
      dispatch({ type: 'set_fetching_more', fetchingMore: false });
    }
  };
  const updateProduct = async (id: string, data: Partial<Product>) => {
    try {
      await productClient.update({
        pathVars: {
          storeId: store.id,
          id,
        },
        index: `products-${store.id}`,
        body: data,
      });
      let entity = 'Producto';
      if (type === 'service') {
        entity = 'Servicio';
      }
      toastRef.current?.show({
        type: 'SUCCESS',
        message: `${entity} actualizado correctamente`,
        expiration: 3,
      });
    } catch (error) {
      // TODO: Log error
      console.log(error);

      toastRef.current?.show({
        message: 'Ocurrió un error inesperado',
        type: 'ERROR',
        expiration: 3,
      });
    }
  };
  const deleteProduct = async (id: string) => {
    try {
      await productClient.delete({
        pathVars: {
          storeId: store.id,
          id,
        },
      });
      let entity = 'Producto';
      if (type === 'service') {
        entity = 'Servicio';
      }
      toastRef.current?.show({
        type: 'SUCCESS',
        message: `${entity} eliminado correctamente`,
        expiration: 3,
      });
    } catch (error) {
      // TODO: Log error
      console.log(error);

      toastRef.current?.show({
        message: 'Ocurrió un error inesperado',
        type: 'ERROR',
        expiration: 3,
      });
    }
  };
  const changeQueryHandler = (query: string) => {
    dispatch({ type: 'change_query', query });
  };
  const changeProductHandler = (
    state: 'created' | 'updated',
    product: Product | Service
  ) => {
    switch (state) {
      case 'created':
        dispatch({ type: 'create_product', product });
        break;
      case 'updated':
        dispatch({ type: 'update_product', product });
        break;
      default:
        throw new Error(
          `${prefix} Error on change product, invalid state, state: ${state}`
        );
    }
  };
  const pressEditProductHandler = (product: Product | Service) => {
    let args = [
      'CreateOrUpdateProduct',
      { product, onChangeProduct: changeProductHandler } as any,
    ];
    if (product.type === 'service') {
      args = [
        'CreateOrUpdateService',
        { service: product, onChangeProduct: changeProductHandler } as any,
      ];
    }
    navigation.navigate(...args);
  };
  const pressDeleteProductHandler = (product: Product) => {
    // edit local state
    dispatch({ type: 'delete_product', product });
    // try to edit backend state
    deleteProduct(product.id);
  };
  const changeEnabledHandler = (id: string, enabled: boolean) => {
    // try to edit backend state
    updateProduct(id, {
      enabled,
    });
  };
  const renderItem = ({ item }: { item: Product }) => {
    return (
      <ProductItem
        data={item}
        editting={state.editting}
        onChangeEnabled={changeEnabledHandler}
        onPressEdit={pressEditProductHandler}
        onPressDelete={pressDeleteProductHandler}
      />
    );
  };
  const addProductHandler = () => {
    let screen = 'CreateOrUpdateProduct';
    if (type === 'service') {
      screen = 'CreateOrUpdateService';
    }
    navigation.navigate(screen, {
      onChangeProduct: changeProductHandler,
    });
  };
  const pressHeaderLink = () => {
    dispatch({ type: 'toogle_editting' });
  };

  useEffect(() => {
    loadProducts(debouncedQuery);
  }, [debouncedQuery]);
  useLayoutEffect(() => {
    let text = 'Editar';
    if (state.editting) {
      text = 'Listo';
    }
    navigation.setOptions({
      headerRight: () => (
        <Button title={text} type="link" onPress={pressHeaderLink} />
      ),
    });
  }, [state.editting]);
  useLayoutEffect(() => {
    let title = 'Mis productos';
    if (type === 'service') {
      title = 'Mis servicios';
    }
    navigation.setOptions({ title });
  }, [type]);

  // render logic
  let content = null;
  let placeholderText = 'Buscar productos';
  let addText = 'Agregar producto';
  if (type === 'service') {
    placeholderText = 'Buscar servicios';
    addText = 'Agregar servicio';
  }
  switch (state.view) {
    case 'DATA':
      if (!state.hits.length) {
        if (state.query) {
          content = (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <NotSearchResult />
              </View>
            </TouchableWithoutFeedback>
          );
        } else {
          content = (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <NotData onCallAction={addProductHandler} />
              </View>
            </TouchableWithoutFeedback>
          );
        }
      } else {
        content = (
          <View style={{ flex: 1 }}>
            <FlatList
              data={state.hits}
              renderItem={renderItem}
              keyExtractor={(product) => product.id}
              initialNumToRender={defaultSize}
              ListFooterComponent={<View style={globalStyles.withScreenAir} />}
              onBeastEndReached={() => {
                if (state.from < state.total) {
                  fetchMoreProducts();
                }
              }}
              style={[{ flex: 1, paddingTop: 5 }, globalStyles.withPadding]}
            />
            <View style={globalStyles.withMargin}>
              <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
              <Shortcut
                image={addProductImage}
                title={addText}
                onPress={addProductHandler}
                style={[globalStyles.withMainActionAir]}
              />
            </View>
          </View>
        );
      }
      break;
    case 'ERROR':
      content = (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <ErrorView />
          </View>
        </TouchableWithoutFeedback>
      );
      break;
    default:
      content = (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Loading />
          </View>
        </TouchableWithoutFeedback>
      );
      break;
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <Search
        placeholder={placeholderText}
        value={state.query}
        onChangeText={changeQueryHandler}
        containerStyle={[globalStyles.withMargin, { marginBottom: 10 }]}
      />
      {content}
    </View>
  );
};
