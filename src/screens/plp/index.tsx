/* eslint-disable react-hooks/exhaustive-deps */
import React, { useReducer, useEffect, ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';

import {
  ScreenView,
  Text,
  ErrorView,
  NotData,
  Loading,
  FlatList,
  SectionList,
} from '../../components';
import { StoreCard, ProductItem, InputSearch } from './components';
import productClient from '../../clients/product-client';
import storeClient from '../../clients/store-client';
import { Product, Store, SearchResponse } from '../../types';
import globalStyle from '../../styles';
import colors from '../../styles/colors';

const mapProductsToSections = (products: Product[]): Section[] => {
  const sections: Section[] = [];
  let lastTag: string | null = null;
  products.forEach((product) => {
    if (lastTag !== product.store.name) {
      sections.push({
        tag: product.store.name,
        data: [],
      });
      lastTag = product.store.name;
    }
    const currenSection = sections[sections.length - 1];
    currenSection.data.push(product);
  });
  return sections;
};

interface Section {
  tag: string;
  data: Product[];
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
type ChangeProductAction = {
  type: 'change_product';
  tag: string;
  product: Product;
};
type SetIsLoadingAction = {
  type: 'set_is_loading';
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
  response: SearchResponse<Partial<Product>>;
};
type SetFetchProductsErrorAction = {
  type: 'set_fetch_products_error';
};
type Action =
  | SetQueryAction
  | ChangeProductAction
  | SetIsLoadingAction
  | SetFetchStoresResponseAction
  | SetFetchStoresErrorAction
  | SetFetchProductsResponseAction
  | SetFetchProductsErrorAction;

type State = {
  view: ViewState;
  query: string;
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
    case 'change_product':
      return state;
    case 'set_is_loading':
      return {
        ...state,
        view: 'LOADING',
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
  const [state, dispatch] = useReducer(reducer, {
    view: 'LOADING',
    query: '',
    filters: {
      position: [-70.63196182250977, -33.44933346731538],
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

  const fetchProducts = async () => {
    try {
      const response = await productClient.search({
        query: state.query,
        filters: {
          position: state.filters.position,
        },
        from: state.productsTrack.from,
        size: 10,
      });
      dispatch({ type: 'set_fetch_products_response', response });
    } catch (error) {
      dispatch({ type: 'set_fetch_products_error' });
    }
  };

  const fetchProductsWithLoading = async () => {
    dispatch({ type: 'set_is_loading' });
    await fetchProducts();
  };

  useEffect(() => {
    if (state.query) {
      fetchProductsWithLoading();
    } else {
      fetchStoresWithLoading();
    }
  }, [state.query]);

  let content: ReactNode;
  switch (state.view) {
    case 'STORES':
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
          renderItem={({ item }) => (
            <StoreCard
              name={item.name}
              image={item.images[0]}
              onPress={() => {
                navigation.navigate('PLPInStore', { store: item.name });
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          onEndReached={(info) => {
            if (
              info.distanceFromEnd > -100 &&
              state.productsTrack.from < state.productsTrack.total
            ) {
              fetchStores();
            }
          }}
          onEndReachedThreshold={0}
        />
      );
      break;
    case 'NOT_STORES':
      content = (
        <NotData
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
      content = (
        <SectionList
          style={[globalStyle.withPadding]}
          stickySectionHeadersEnabled
          sections={state.productsTrack.sections}
          keyExtractor={(item, index) => `${index}-${item.id}`}
          renderItem={({ item, index, section }) => {
            let style: ViewStyle = { marginBottom: 5 };
            if (index === section.data.length - 1) {
              style = { marginBottom: 15 };
            }
            return (
              <ProductItem
                data={item}
                onChange={(data) => {
                  dispatch({
                    type: 'change_product',
                    tag: section.tag,
                    product: data,
                  });
                }}
                onSeeDetail={() => {
                  navigation.navigate('PDP', item);
                }}
                style={style}
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
          onEndReached={(info) => {
            if (
              info.distanceFromEnd > -100 &&
              state.productsTrack.from < state.productsTrack.total
            ) {
              fetchProducts();
            }
          }}
          onEndReachedThreshold={0}
        />
      );
      break;
    case 'NOT_PRODUCTS':
      content = <NotData />;
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
    <ScreenView style={{ width: '100%', borderStyle: 'solid', borderWidth: 0 }}>
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
