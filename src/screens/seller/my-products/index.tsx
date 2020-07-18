import React, { useReducer, useEffect, useLayoutEffect, useRef } from 'react';
import { View, Keyboard, TouchableWithoutFeedback } from 'react-native';
import axios, { CancelTokenSource } from 'axios';
import { useIsFocused } from '@react-navigation/native';

// components
import {
  FlatList,
  Loading,
  ErrorView,
  NotSearchResult,
  Button,
  IToast,
  Toast,
  Text,
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
type MyProductsView =
  | 'LOADING'
  | 'NOT_SEARCH_RESULT'
  | 'NOT_DATA'
  | 'DATA'
  | 'ERROR';
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
type DeleteProductAction = {
  type: 'delete_product';
  product: Product;
};
type Action =
  | ChangeQueryAction
  | ChangeViewAction
  | SetResponseAction
  | ToogleEdittingAction
  | DeleteProductAction;
type State = {
  view: MyProductsView;
  editting: boolean;
  query: string;
  from: number;
  size: number;
  total: number;
  hits: (Product | Service)[];
};
const reducer = (state: State, action: Action): State => {
  let view: MyProductsView;
  let hits: (Product | Service)[];
  switch (action.type) {
    case 'change_query':
      return { ...state, query: action.query };
    case 'change_view':
      return { ...state, view: action.view };
    case 'set_response':
      view = 'DATA';
      if (!action.response.hits.length) {
        view = 'NOT_DATA';
        if (state.query) {
          view = 'NOT_SEARCH_RESULT';
        }
      }
      return {
        ...state,
        view,
        ...action.response,
        // increment from
        from: action.response.from + action.response.size,
      };
    case 'toogle_editting':
      return { ...state, editting: !state.editting };
    case 'delete_product':
      hits = state.hits.filter((hit) => hit.id !== action.product.id);
      view = 'DATA';
      if (!hits.length) {
        view = 'NOT_DATA';
        if (state.query) {
          view = 'NOT_SEARCH_RESULT';
        }
      }
      return {
        ...state,
        view,
        hits,
      };
    default:
      return state;
  }
};

export interface MyProductsProps {
  navigation: any;
}

export default ({ navigation }: MyProductsProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    view: 'LOADING',
    editting: false,
    query: '',
    from: 0,
    size: defaultSize,
    total: 0,
    hits: [],
  });
  const userContainer = UserProvider.useContainer();
  const store = userContainer.getStore();
  const debouncedQuery = useDebounce(state.query, 200);
  const isFocused = useIsFocused();
  const toastRef = useRef<IToast>(null);

  // preconditions
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }

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
          type: 'product',
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
  const updateProduct = async (id: string, data: Partial<Product>) => {
    try {
      await productClient.update({
        pathVars: {
          storeId: store.id,
          id,
        },
        body: data,
      });
      toastRef.current?.show({
        type: 'SUCCESS',
        message: 'Producto actualizado correctamente',
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
      toastRef.current?.show({
        type: 'SUCCESS',
        message: 'Producto eliminado correctamente',
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
  const pressEditProductHandler = (product: Product) => {
    navigation.navigate('CreateOrUpdateProduct', {
      product,
    });
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
    navigation.navigate('CreateOrUpdateProduct');
  };
  const pressHeaderLink = () => {
    dispatch({ type: 'toogle_editting' });
  };

  useEffect(() => {
    if (isFocused) {
      loadProducts(debouncedQuery);
    }
  }, [isFocused, debouncedQuery]);
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

  // render logic
  let content = null;
  switch (state.view) {
    case 'NOT_SEARCH_RESULT':
      content = (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <NotSearchResult />
          </View>
        </TouchableWithoutFeedback>
      );
      break;
    case 'NOT_DATA':
      content = (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <NotData onCallAction={addProductHandler} />
          </View>
        </TouchableWithoutFeedback>
      );
      break;
    case 'DATA':
      content = (
        <View style={{ flex: 1 }}>
          <FlatList
            data={state.hits}
            renderItem={renderItem}
            keyExtractor={(product) => product.id}
            initialNumToRender={defaultSize}
            ListFooterComponent={<View style={globalStyles.withScreenAir} />}
            style={[{ flex: 1, paddingTop: 5 }, globalStyles.withPadding]}
          />
          <View style={globalStyles.withMargin}>
            <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
            <Shortcut
              image={addProductImage}
              title="Agregar producto"
              onPress={addProductHandler}
              style={[globalStyles.withMainActionAir]}
            />
          </View>
        </View>
      );
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
        placeholder="Buscar productos"
        value={state.query}
        onChangeText={changeQueryHandler}
        containerStyle={[globalStyles.withMargin, { marginBottom: 10 }]}
      />
      {content}
    </View>
  );
};
