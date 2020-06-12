/* eslint-disable react-hooks/exhaustive-deps */
import React, { useReducer, useEffect, ReactNode } from 'react';
import { View, FlatList, SectionList, ViewStyle } from 'react-native';

import { ScreenView, Text, ErrorView, NotData } from '../../components';
import { StoreCard, ProductItem, InputSearch } from './components';
import productClient from '../../clients/product-client';
import storeClient from '../../clients/store-client';
import { Product, Store } from '../../types';
import globalStyle from '../../styles';
import colors from '../../styles/colors';

interface Section {
  tag: string;
  data: Product[];
}
type ViewState =
  | 'LOADING'
  | 'ERROR'
  | 'STORES'
  | 'NOT_STORES'
  | 'PRODUCTS'
  | 'NOT_PRODUCTS';

// actions
type ChangeViewAction = {
  type: 'change_view';
  view: ViewState;
  newState?: any;
};
type SetStoreAction = {
  type: 'set_store';
  store: string;
};
type SetQueryAction = {
  type: 'set_query';
  query: string;
};
type ChangeProductAction = {
  type: 'change_product';
  tag: string;
  product: Product;
};
type Action =
  | ChangeViewAction
  | SetStoreAction
  | SetQueryAction
  | ChangeProductAction;

type State = {
  view: ViewState;
  query: string;
  filters: {
    store: string;
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
  error: Error | null;
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_view':
      return { ...state, ...action.newState, view: action.view };
    case 'set_store':
      return { ...state, filters: { ...state.filters, store: action.store } };
    case 'set_query':
      return { ...state, query: action.query };
    case 'change_product':
      return {
        ...state,
        productsTrack: {
          ...state.productsTrack,
          sections: state.productsTrack.sections.map((section) => {
            const modifiedSection = { ...section };
            if (section.tag === action.tag) {
              modifiedSection.data = section.data.map((product) => {
                if (product.id === action.product.id) {
                  return action.product;
                }
                return product;
              });
            }
            return modifiedSection;
          }),
        },
      };
    default:
      return state;
  }
};

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

export interface PLPScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation }: PLPScreenProps) => {
  const [state, dispatch] = useReducer(reducer, {
    view: 'LOADING',
    query: '',
    filters: {
      store: '',
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
    error: null,
  });

  const fetchProducts = async (
    query: string,
    filters: any,
    from = 0,
    size = 20
  ) => {
    const response = await productClient.search({
      query,
      filters,
      from,
      size,
    });
    if (!response.hits.length) {
      dispatch({
        type: 'change_view',
        view: 'NOT_PRODUCTS',
        newState: { productsTrack: { from: 0, total: 0, products: [] } },
      });
    } else {
      let products = [...state.productsTrack.products];
      // is a fresh fetching
      if (from === 0) {
        products = [];
      }
      products = Array.prototype.concat(products, response.hits);
      const sections = mapProductsToSections(products);
      dispatch({
        type: 'change_view',
        view: 'PRODUCTS',
        newState: {
          productsTrack: {
            from: response.hits.length,
            total: response.total,
            products,
            sections,
          },
        },
      });
    }
  };

  const fetchStores = async (filters: any, from = 0, size = 10) => {
    const response = await storeClient.search({
      filters,
      from,
      size,
    });
    if (!response.hits.length) {
      dispatch({
        type: 'change_view',
        view: 'NOT_STORES',
        newState: { storesTrack: { from: 0, total: 0, stores: [] } },
      });
      return;
    }
    let stores = [...state.storesTrack.stores];
    // is a fresh fetching
    if (from === 0) {
      stores = [];
    }
    dispatch({
      type: 'change_view',
      view: 'STORES',
      newState: {
        storesTrack: {
          from: response.hits.length,
          total: response.total,
          stores: Array.prototype.concat(stores, response.hits),
        },
      },
    });
  };

  const fetchFreshData = async () => {
    try {
      dispatch({ type: 'change_view', view: 'LOADING' });
      if (state.query || state.filters.store) {
        await fetchProducts(state.query, state.filters);
        return;
      }
      await fetchStores({ position: state.filters.position });
    } catch (error) {
      console.log(error);
      dispatch({
        type: 'change_view',
        view: 'ERROR',
        newState: { error },
      });
    }
  };

  const changeHandler = (tag: string, product: Product) =>
    dispatch({ type: 'change_product', tag, product });
  const seeDetailHandler = (product: Product) => {
    navigation.navigate('PDP', product);
  };

  useEffect(() => {
    fetchFreshData();
  }, [state.query, state.filters.position, state.filters.store]);

  let content: ReactNode;
  switch (state.view) {
    case 'ERROR':
      content = <ErrorView />;
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
        />
      );
      break;
    case 'NOT_PRODUCTS':
      content = <NotData />;
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
                  changeHandler(section.tag, data);
                }}
                onSeeDetail={seeDetailHandler}
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
        />
      );
      break;

    default:
      content = (
        <View>
          <Text level={7}>Loading view</Text>
        </View>
      );
      break;
  }

  return (
    <ScreenView style={{ width: '100%', borderStyle: 'solid', borderWidth: 0 }}>
      <InputSearch
        placeholder="Buscar productos"
        onChangeText={(text) => {
          dispatch({ type: 'set_query', query: text });
        }}
        containerStyle={[globalStyle.withMargin, { marginBottom: 15 }]}
      />
      {content}
    </ScreenView>
  );
};
