/* eslint-disable react-hooks/exhaustive-deps */
import React, { useReducer, useEffect, ReactNode } from 'react';
import { ViewStyle } from 'react-native';

import {
  ScreenView,
  ErrorView,
  NotData,
  Loading,
  FlatList,
} from '../../../components';
import { InputSearch, ProductItem } from '../components';
import { Product, SearchResponse } from '../../../types';
import productClient from '../../../clients/product-client';
import globalStyle from '../../../styles';

type ViewState = 'LOADING' | 'ERROR' | 'PRODUCTS' | 'NOT_PRODUCTS';

// actions
type SetQueryAction = {
  type: 'set_query';
  query: string;
};
type SetIsLoadingAction = {
  type: 'set_is_loading';
};
type SetFetchResponseAction = {
  type: 'set_fetch_response';
  response: SearchResponse<Partial<Product>>;
};
type SetErrorAction = {
  type: 'set_error';
  error: Error;
};
type ChangeProductAction = {
  type: 'change_product';
  product: Product;
};
type Action =
  | SetQueryAction
  | SetIsLoadingAction
  | SetFetchResponseAction
  | SetErrorAction
  | ChangeProductAction;

type State = {
  view: ViewState;
  query: string;
  filters: {
    store: string;
    position: number[];
  };
  productsTrack: {
    from: number;
    total: number;
    products: Product[];
  };
  error: Error | null;
};

const reducer = (state: State, action: Action): State => {
  let productsTrack = null;
  let products: Product[];
  let view: ViewState;
  switch (action.type) {
    case 'set_query':
      return {
        ...state,
        query: action.query,
        productsTrack: { ...state.productsTrack, from: 0 },
      };
    case 'set_is_loading':
      return {
        ...state,
        view: 'LOADING',
      };
    case 'set_fetch_response':
      products = state.productsTrack.products;
      if (state.productsTrack.from === 0) {
        products = [];
      }
      productsTrack = {
        from: state.productsTrack.from + action.response.hits.length,
        total: action.response.total,
        products: Array.prototype.concat(products, action.response.hits),
      };
      view = productsTrack.products.length > 0 ? 'PRODUCTS' : 'NOT_PRODUCTS';
      return {
        ...state,
        view,
        productsTrack,
      };
    case 'set_error':
      return {
        ...state,
        view: 'ERROR',
        error: action.error,
      };
    case 'change_product':
      return {
        ...state,
        productsTrack: {
          ...state.productsTrack,
          products: state.productsTrack.products.map((product) => {
            if (product.id === action.product.id) {
              return action.product;
            }
            return product;
          }),
        },
      };
    default:
      return state;
  }
};

export interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  const [state, dispatch] = useReducer(reducer, {
    view: 'LOADING',
    query: '',
    filters: {
      store: route.params.store,
      position: [-70.63196182250977, -33.44933346731538],
    },
    productsTrack: {
      from: 0,
      total: 0,
      products: [],
    },
    error: null,
  });

  const fetchProducts = async () => {
    try {
      const response = await productClient.search({
        query: state.query,
        filters: {
          position: state.filters.position,
          store: state.filters.store,
        },
        from: state.productsTrack.from,
        size: 10,
      });
      dispatch({ type: 'set_fetch_response', response });
    } catch (error) {
      dispatch({ type: 'set_error', error });
    }
  };

  const fetchData = async () => {
    dispatch({ type: 'set_is_loading' });
    await fetchProducts();
  };

  const fetchMore = async () => {
    await fetchProducts();
  };

  useEffect(() => {
    fetchData();
  }, [state.query]);

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: state.filters.store });
  }, [state.filters.store]);

  let content: ReactNode;
  switch (state.view) {
    case 'ERROR':
      content = (
        <ErrorView
          onRetry={() => {
            fetchData();
          }}
        />
      );
      break;
    case 'NOT_PRODUCTS':
      content = <NotData />;
      break;
    case 'PRODUCTS':
      content = (
        <FlatList
          style={[globalStyle.withPadding]}
          data={state.productsTrack.products}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            let style: ViewStyle = { marginBottom: 5 };
            if (index === state.productsTrack.products.length - 1) {
              style = { marginBottom: 15 };
            }
            return (
              <ProductItem
                data={item}
                onChange={(product) => {
                  dispatch({ type: 'change_product', product });
                }}
                onSeeDetail={(product) => {
                  navigation.navigate('PDP', product);
                }}
                style={style}
              />
            );
          }}
          onBeastEndReached={() => {
            if (state.productsTrack.from < state.productsTrack.total) {
              fetchMore();
            }
          }}
        />
      );
      break;

    default:
      content = <Loading />;
      break;
  }

  return (
    <ScreenView keyboardAvoiding={false} style={{ flex: 1 }}>
      <InputSearch
        placeholder="Buscar productos"
        value={state.query}
        onChangeText={(text) => {
          dispatch({ type: 'set_query', query: text });
        }}
        containerStyle={[globalStyle.withMargin, { marginBottom: 15 }]}
      />
      {content}
    </ScreenView>
  );
};
