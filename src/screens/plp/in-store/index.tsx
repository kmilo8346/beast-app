/* eslint-disable react-hooks/exhaustive-deps */
import React, { useReducer, useEffect, ReactNode } from 'react';
import { View } from 'react-native';

// components
import {
  Container,
  ErrorView,
  NotSearchResult,
  Loading,
  FlatList,
  Text,
  ProductItem,
} from '../../../components';
// local components
import { InputSearch } from '../components';
// containers
import UserProvider from '../../../containers/user';
// types
import { Product, Service, SearchResponse } from '../../../types';
// clients
import productClient from '../../../clients/product-client';
// styles
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
type SetIsFetchingMoreAction = {
  type: 'set_is_fetching_more';
  isFetchingMore: boolean;
};
type SetFetchResponseAction = {
  type: 'set_fetch_response';
  response: SearchResponse<Partial<Product | Service>>;
};
type SetErrorAction = {
  type: 'set_error';
  error: Error;
};
type Action =
  | SetQueryAction
  | SetIsLoadingAction
  | SetIsFetchingMoreAction
  | SetFetchResponseAction
  | SetErrorAction;

type State = {
  view: ViewState;
  query: string;
  isFetchingMore: boolean;
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
    case 'set_is_fetching_more':
      return {
        ...state,
        isFetchingMore: action.isFetchingMore,
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
    default:
      return state;
  }
};

export interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  const userContainer = UserProvider.useContainer();
  const currentAddress = userContainer.getCurrentAddress();
  // in store
  const store = route.params.store;
  if (!currentAddress) {
    throw new Error('Current address must be defined');
  }
  const [state, dispatch] = useReducer(reducer, {
    view: 'LOADING',
    query: '',
    isFetchingMore: false,
    filters: {
      store: store.id,
      position: [
        currentAddress.geometry.location.lng,
        currentAddress.geometry.location.lat,
      ],
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
        pathVars: {
          storeId: store.id,
        },
        query: state.query,
        filters: {
          position: state.filters.position,
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
    dispatch({ type: 'set_is_fetching_more', isFetchingMore: true });
    try {
      await fetchProducts();
    } finally {
      dispatch({ type: 'set_is_fetching_more', isFetchingMore: false });
    }
  };

  useEffect(() => {
    fetchData();
  }, [state.query]);

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: store.name });
  }, [state.filters.store]);

  let content: ReactNode;
  let listFooter = null;
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
      content = <NotSearchResult />;
      break;
    case 'PRODUCTS':
      if (state.isFetchingMore) {
        listFooter = (
          <Text
            level={6}
            weight="bold"
            style={{
              textAlign: 'center',
            }}
          >
            ...
          </Text>
        );
      }
      content = (
        <FlatList
          style={[globalStyle.withPadding]}
          data={state.productsTrack.products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            return (
              <ProductItem
                data={item}
                onSeeDetail={(product) => {
                  navigation.navigate('PDP', product);
                }}
                style={{ marginBottom: 5 }}
              />
            );
          }}
          onBeastEndReached={() => {
            if (state.productsTrack.from < state.productsTrack.total) {
              fetchMore();
            }
          }}
          ListFooterComponent={
            <View style={globalStyle.withCartSpace}>{listFooter}</View>
          }
        />
      );
      break;

    default:
      content = <Loading />;
      break;
  }

  return (
    <Container keyboardAvoiding={false} style={{ flex: 1 }}>
      <InputSearch
        placeholder="Buscar productos"
        value={state.query}
        onChangeText={(text) => {
          dispatch({ type: 'set_query', query: text });
        }}
        containerStyle={[globalStyle.withMargin, { marginBottom: 15 }]}
      />
      {content}
    </Container>
  );
};
