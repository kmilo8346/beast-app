import React, { useReducer, useEffect, useLayoutEffect, useRef } from 'react';
import {
  View,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import axios, { CancelTokenSource } from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import Loading from '../../../components/loading';
import ErrorView from '../../../components/error-view';
import NotSearchResult from '../../../components/not-search-result';
import Button from '../../../components/buttons/button';
import Toast, { IToast } from '../../../components/toast';
import Search from '../../../components/inputs/search';
import AddCircleBlueIcon from '../../../components/svgs/icons/add-circle-blue';
// seller components
import Shortcut from '../components/shortcut';
// local components
import ProductItem from './components/product-item';
import NotData from './components/not-data';
// clients
import productClient from '../../../clients/product-client';
// cache
import userCache from '../../../cache/user';
import storeCache from '../../../cache/store';
// libs
import useDebounce from '../../../lib/hooks/use-debounce';
// types
import { Product, SearchResponse } from '../../../types';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[my products component]';
let fetchRequestSource: CancelTokenSource;
const defaultSize = 10;
const defaultProducts: SearchResponse<Product> = {
  from: 0,
  size: defaultSize,
  total: 0,
  hits: [],
};
enum MyProductsView {
  LOADING = 'loading',
  DATA = 'data',
  ERROR = 'error',
}
type SetHeaderAction = {
  type: 'set_header';
  header: boolean;
};
type ChangeQueryAction = {
  type: 'change_query';
  query: string;
};
type ChangeViewAction = {
  type: 'change_view';
  view: MyProductsView;
};
type SetProductsAction = {
  type: 'set_products';
  products: SearchResponse<Product>;
};
type ToogleEdittingAction = {
  type: 'toogle_editting';
};
type CreateProductAction = {
  type: 'create_product';
  product: Product;
};
type UpdateProductAction = {
  type: 'update_product';
  product: Product;
};
type DeleteProductAction = {
  type: 'delete_product';
  product: Product;
};
type SetFetchingMoreAction = {
  type: 'set_fetching_more';
  fetching_more: boolean;
};
type Action =
  | SetHeaderAction
  | ChangeQueryAction
  | ChangeViewAction
  | SetProductsAction
  | ToogleEdittingAction
  | CreateProductAction
  | UpdateProductAction
  | DeleteProductAction
  | SetFetchingMoreAction;
type State = {
  header: boolean;
  view: MyProductsView;
  editting: boolean;
  fetching_more: boolean;
  query: string;
  products?: SearchResponse<Product>;
};
const reducer = (state: State, action: Action): State => {
  let products;
  switch (action.type) {
    case 'set_header':
      return { ...state, header: action.header };
    case 'change_query':
      return { ...state, query: action.query };
    case 'change_view':
      return { ...state, view: action.view };
    case 'set_products':
      return {
        ...state,
        view: MyProductsView.DATA,
        products: action.products,
      };
    case 'toogle_editting':
      return { ...state, editting: !state.editting };
    case 'create_product':
      products = { ...(state.products || defaultProducts) };
      products.from += 1;
      products.total += 1;
      products.hits = [...products.hits, action.product];
      return {
        ...state,
        products,
      };
    case 'update_product':
      products = { ...(state.products as SearchResponse<Product>) };
      products.hits = products.hits.map((hit) => {
        if (hit.id === action.product.id) {
          return { ...action.product };
        }
        return hit;
      });
      return {
        ...state,
        products,
      };
    case 'delete_product':
      products = { ...(state.products as SearchResponse<Product>) };
      products.from -= 1;
      products.total -= 1;
      products.hits = products.hits.filter(
        (hit) => hit.id !== action.product.id
      );
      return {
        ...state,
        products,
      };
    case 'set_fetching_more':
      return { ...state, fetching_more: action.fetching_more };
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
    header: true,
    view: MyProductsView.LOADING,
    editting: false,
    fetching_more: false,
    query: '',
  });
  const user = userCache.getData();
  // preconditions
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const store = storeCache.getData();
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }
  const debouncedQuery = useDebounce(state.query, 200);
  const toastRef = useRef<IToast>(null);
  const insets = useSafeAreaInsets();

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
        filters: {},
        from,
        size,
      },
      fetchRequestSource.token
    );
    return response;
  };

  const loadProducts = async (query: string) => {
    try {
      dispatch({ type: 'change_view', view: MyProductsView.LOADING });
      const response = await fetchProducts(query);
      dispatch({
        type: 'set_products',
        products: {
          ...response,
          from: response.from + response.hits.length,
        },
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        // TODO: Log error
        console.log(error);

        dispatch({ type: 'change_view', view: MyProductsView.ERROR });
      }
    }
  };

  const fetchMoreProducts = async () => {
    // precondition
    if (!state.products) {
      console.warn(`${prefix} Cant call fetch more with products undefined`);
      return;
    }
    try {
      dispatch({ type: 'set_fetching_more', fetching_more: true });
      const products = await fetchProducts(
        state.query,
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
        // TODO: Log error
        console.log(error);

        dispatch({ type: 'change_view', view: MyProductsView.ERROR });
      }
    } finally {
      dispatch({ type: 'set_fetching_more', fetching_more: false });
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
        message: `Producto actualizado correctamente`,
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
        message: `Producto eliminado correctamente`,
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
    product: Product
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

  const pressEditProductHandler = (product: Product) => {
    navigation.navigate('CreateOrUpdateProduct', {
      product,
      onChangeProduct: changeProductHandler,
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

  const addProductHandler = () => {
    navigation.navigate('CreateOrUpdateProduct', {
      onChangeProduct: changeProductHandler,
    });
  };

  const pressHeaderLink = () => {
    dispatch({ type: 'toogle_editting' });
  };

  const searchActivatedHandler = () => {
    dispatch({ type: 'set_header', header: false });
  };

  const searchDeactivatedHandler = () => {
    dispatch({ type: 'set_header', header: true });
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
    navigation.setOptions({
      headerShown: state.header,
    });
  }, [state.header]);

  // render logic
  let content = null;
  switch (state.view) {
    case MyProductsView.DATA:
      if (!state.products?.hits.length) {
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
              data={state.products.hits}
              renderItem={({ item }) => {
                return (
                  <ProductItem
                    data={item}
                    editting={state.editting}
                    onChangeEnabled={changeEnabledHandler}
                    onPressEdit={pressEditProductHandler}
                    onPressDelete={pressDeleteProductHandler}
                  />
                );
              }}
              keyExtractor={(product) => product.id}
              initialNumToRender={defaultSize}
              ListFooterComponent={<View style={globalStyles.withScreenAir} />}
              onEndReached={() => {
                if (
                  state.products &&
                  state.products.from < state.products.total
                ) {
                  fetchMoreProducts();
                }
              }}
              style={[{ flex: 1, paddingTop: 5 }, globalStyles.withPadding]}
            />
            <View style={globalStyles.withMargin}>
              <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
              <Shortcut
                image={<AddCircleBlueIcon />}
                title="Agregar producto"
                onPress={addProductHandler}
                style={[globalStyles.withMainActionAir]}
              />
            </View>
          </View>
        );
      }
      break;
    case MyProductsView.ERROR:
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
    <View
      style={{
        flex: 1,
        backgroundColor: colors.white,
        paddingTop: state.header ? 0 : insets.top,
      }}
    >
      <Search
        placeholder="Buscar productos"
        value={state.query}
        onChangeText={changeQueryHandler}
        containerStyle={[globalStyles.withMargin, { marginBottom: 10 }]}
        onActivated={searchActivatedHandler}
        onDeactivated={searchDeactivatedHandler}
      />
      {content}
    </View>
  );
};
