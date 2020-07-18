/* eslint-disable react-hooks/exhaustive-deps */
import React, { useReducer, useEffect, ReactNode } from 'react';
import { View } from 'react-native';

// clients
import productClient from '../../clients/product-client';
import storeClient from '../../clients/store-client';
// components
import {
  Container,
  Text,
  ErrorView,
  NotSearchResult,
  Loading,
  FlatList,
  SectionList,
  ProductItem,
} from '../../components';
// local components
import { StoreCard, InputSearch } from './components';
// containers
import UserProvider from '../../containers/user';
// types
import { Product, Service, Store, SearchResponse } from '../../types';
// styles
import globalStyle from '../../styles';
import colors from '../../styles/colors';

const mapProductsToSections = (products: (Product | Service)[]): Section[] => {
  const sections: Section[] = [];
  let lastTag: string | null = null;
  products.forEach((product) => {
    if (lastTag !== product.store.name) {
      sections.push({
        tag: product.store.name as string,
        data: [],
      });
      lastTag = product.store.name as string;
    }
    const currenSection = sections[sections.length - 1];

    currenSection.data.push(product);
  });
  return sections;
};

interface Section {
  tag: string;
  data: (Product | Service)[];
}
type ViewState =
  | 'LOADING'
  | 'STORES'
  | 'NOT_STORES'
  | 'FETCH_STORES_ERROR'
  | 'PRODUCTS'
  | 'NOT_PRODUCTS'
  | 'FETCH_PRODUCTS_ERROR';

// actions;
type SetQueryAction = {
  type: 'set_query';
  query: string;
};
type SetIsLoadingAction = {
  type: 'set_is_loading';
};
type SetIsFetchingMoreStoresAction = {
  type: 'set_is_fetching_more_stores';
  isFetchingMoreStores: boolean;
};
type SetIsFetchingMoreProductsAction = {
  type: 'set_is_fetching_more_products';
  isFetchingMoreProducts: boolean;
};
type SetFetchStoresResponseAction = {
  type: 'set_fetch_stores_response';
  response: SearchResponse<Partial<Store>>;
};
type SetFetchStoresErrorAction = {
  type: 'set_fetch_stores_error';
};
type SetFetchProductsResponseAction = {
  type: 'set_fetch_products_response';
  response: SearchResponse<Product | Service>;
};
type SetFetchProductsErrorAction = {
  type: 'set_fetch_products_error';
};
type Action =
  | SetQueryAction
  | SetIsLoadingAction
  | SetIsFetchingMoreStoresAction
  | SetIsFetchingMoreProductsAction
  | SetFetchStoresResponseAction
  | SetFetchStoresErrorAction
  | SetFetchProductsResponseAction
  | SetFetchProductsErrorAction;

type State = {
  view: ViewState;
  query: string;
  isFetchingMoreStores: boolean;
  isFetchingMoreProducts: boolean;
  filters: {
    position: number[];
  };
  storesTrack: {
    from: number;
    total: number;
    stores: Store[];
  };
  productsTrack: {
    from: number;
    total: number;
    products: Product[];
    sections: Section[];
  };
};

const reducer = (state: State, action: Action): State => {
  let storesTrack;
  let products: Product[];
  let productsTrack = null;
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
    case 'set_is_fetching_more_stores':
      return {
        ...state,
        isFetchingMoreStores: action.isFetchingMoreStores,
      };
    case 'set_is_fetching_more_products':
      return {
        ...state,
        isFetchingMoreProducts: action.isFetchingMoreProducts,
      };
    case 'set_fetch_stores_response':
      storesTrack = {
        from: state.storesTrack.from + action.response.hits.length,
        total: action.response.total,
        stores: Array.prototype.concat(
          state.storesTrack.stores,
          action.response.hits
        ),
      };
      view = storesTrack.stores.length > 0 ? 'STORES' : 'NOT_STORES';
      return {
        ...state,
        view,
        storesTrack,
      };
    case 'set_fetch_stores_error':
      return {
        ...state,
        view: 'FETCH_STORES_ERROR',
      };
    case 'set_fetch_products_response':
      products = state.productsTrack.products;
      if (state.productsTrack.from === 0) {
        products = [];
      }
      products = Array.prototype.concat(products, action.response.hits);
      productsTrack = {
        from: state.productsTrack.from + action.response.hits.length,
        total: action.response.total,
        products,
        sections: mapProductsToSections(products),
      };
      view = productsTrack.products.length > 0 ? 'PRODUCTS' : 'NOT_PRODUCTS';
      return {
        ...state,
        view,
        productsTrack,
      };
    case 'set_fetch_products_error':
      return {
        ...state,
        view: 'FETCH_PRODUCTS_ERROR',
      };
    default:
      return state;
  }
};

export interface PLPScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation }: PLPScreenProps) => {
  const userContainer = UserProvider.useContainer();
  const currentAddress = userContainer.getCurrentAddress();
  if (!currentAddress) {
    throw new Error('Current address must be defined');
  }
  const [state, dispatch] = useReducer(reducer, {
    view: 'LOADING',
    query: '',
    isFetchingMoreStores: false,
    isFetchingMoreProducts: false,
    filters: {
      position: [
        currentAddress.geometry.location.lng,
        currentAddress.geometry.location.lat,
      ],
    },
    storesTrack: {
      from: 0,
      total: 0,
      stores: [],
    },
    productsTrack: {
      from: 0,
      total: 0,
      products: [],
      sections: [],
    },
  });

  const fetchStores = async () => {
    try {
      const response = await storeClient.search({
        filters: {
          position: state.filters.position,
        },
        from: state.storesTrack.from,
        size: 10,
      });
      dispatch({ type: 'set_fetch_stores_response', response });
    } catch (error) {
      dispatch({ type: 'set_fetch_stores_error' });
    }
  };

  const fetchStoresWithLoading = async () => {
    dispatch({ type: 'set_is_loading' });
    await fetchStores();
  };

  const fetchMoreStores = async () => {
    dispatch({
      type: 'set_is_fetching_more_stores',
      isFetchingMoreStores: true,
    });
    try {
      await fetchStores();
    } finally {
      dispatch({
        type: 'set_is_fetching_more_stores',
        isFetchingMoreStores: false,
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productClient.search({
        pathVars: {
          storeId: '-',
        },
        query: state.query,
        filters: {
          position: state.filters.position,
        },
        from: state.productsTrack.from,
        size: 10,
      });
      dispatch({
        type: 'set_fetch_products_response',
        response,
      });
    } catch (error) {
      dispatch({ type: 'set_fetch_products_error' });
    }
  };

  const fetchProductsWithLoading = async () => {
    dispatch({ type: 'set_is_loading' });
    await fetchProducts();
  };

  const fetchMoreProducts = async () => {
    dispatch({
      type: 'set_is_fetching_more_products',
      isFetchingMoreProducts: true,
    });
    try {
      await fetchProducts();
    } finally {
      dispatch({
        type: 'set_is_fetching_more_products',
        isFetchingMoreProducts: false,
      });
    }
  };

  useEffect(() => {
    if (state.query) {
      fetchProductsWithLoading();
    } else {
      fetchStoresWithLoading();
    }
  }, [state.query]);

  let content: ReactNode;
  let listStoresFooter = null;
  let listProductsFooter = null;
  switch (state.view) {
    case 'STORES':
      if (state.isFetchingMoreStores) {
        listStoresFooter = (
          <Text level={6} weight="bold" style={{ textAlign: 'center' }}>
            ...
          </Text>
        );
      }
      content = (
        <FlatList
          style={[globalStyle.withPadding]}
          columnWrapperStyle={{
            marginBottom: 10,
            justifyContent: 'space-between',
          }}
          ListHeaderComponent={
            <Text level={5} weight="bold" style={{ marginBottom: 22 }}>
              Negocios a tu alrededor
            </Text>
          }
          numColumns={2}
          data={state.storesTrack.stores}
          renderItem={({ item }) => {
            return (
              <StoreCard
                id={item.id}
                name={item.name}
                image={item.images[0]}
                onPress={() => {
                  navigation.navigate('PLPInStore', { store: item });
                }}
              />
            );
          }}
          keyExtractor={(item) => item.id}
          onBeastEndReached={() => {
            if (state.productsTrack.from < state.productsTrack.total) {
              fetchMoreStores();
            }
          }}
          ListFooterComponent={
            <View style={globalStyle.withCartSpace}>{listStoresFooter}</View>
          }
        />
      );
      break;
    case 'NOT_STORES':
      content = (
        <NotSearchResult
          title="No hay tiendas registradas"
          subtitle="Empieza a vender totalmente gratis"
          action="Vender"
          onCallAction={() => {
            navigation.navigate('ToSale');
          }}
        />
      );
      break;
    case 'FETCH_STORES_ERROR':
      content = (
        <ErrorView
          onRetry={() => {
            fetchStoresWithLoading();
          }}
        />
      );
      break;
    case 'PRODUCTS':
      if (state.isFetchingMoreProducts) {
        listProductsFooter = (
          <Text level={6} weight="bold" style={{ textAlign: 'center' }}>
            ...
          </Text>
        );
      }
      content = (
        <SectionList
          style={[globalStyle.withPadding]}
          initialNumToRender={10}
          stickySectionHeadersEnabled
          sections={state.productsTrack.sections}
          keyExtractor={(item, index) => `${index}-${item.id}`}
          renderItem={({ item }) => {
            return (
              <ProductItem
                data={item}
                onSeeDetail={(data) => {
                  navigation.navigate('PDP', data);
                }}
                style={{ marginBottom: 5 }}
              />
            );
          }}
          renderSectionHeader={({ section: { tag } }) => (
            <View
              style={{
                marginBottom: 5,
                backgroundColor: colors.white,
                paddingBottom: 5,
              }}
            >
              <Text
                style={{ textTransform: 'uppercase' }}
                level={6}
                color={colors.blackLight2}
              >
                {tag}
              </Text>
            </View>
          )}
          onBeastEndReached={() => {
            if (state.productsTrack.from < state.productsTrack.total) {
              fetchMoreProducts();
            }
          }}
          ListFooterComponent={
            <View style={globalStyle.withCartSpace}>{listProductsFooter}</View>
          }
        />
      );
      break;
    case 'NOT_PRODUCTS':
      content = <NotSearchResult />;
      break;
    case 'FETCH_PRODUCTS_ERROR':
      content = (
        <ErrorView
          onRetry={() => {
            fetchProductsWithLoading();
          }}
        />
      );
      break;
    default:
      content = <Loading />;
      break;
  }

  return (
    <Container>
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
