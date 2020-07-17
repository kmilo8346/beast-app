import React, { useReducer, useEffect } from 'react';
import { View, Keyboard, TouchableWithoutFeedback } from 'react-native';
import axios, { CancelTokenSource } from 'axios';
import { useIsFocused } from '@react-navigation/native';

// components
import { FlatList, Loading, ErrorView, NotData } from '../../../components';
// seller components
import { Shortcut } from '../components';
// local components
import { ProductItem, Search } from './components';
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
type Action = ChangeQueryAction | ChangeViewAction | SetResponseAction;
type State = {
  view: MyProductsView;
  query: string;
  from: number;
  size: number;
  total: number;
  hits: (Product | Service)[];
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_query':
      return { ...state, query: action.query };
    case 'change_view':
      return { ...state, view: action.view };
    case 'set_response':
      return {
        ...state,
        view: 'DATA',
        ...action.response,
        // increment from
        from: action.response.from + action.response.size,
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
    view: 'ERROR',
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

  // preconditions
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }
  // event handlers
  const changeQueryHandler = (query: string) => {
    dispatch({ type: 'change_query', query });
  };
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
  const pressProductItem = (product: Product) => {
    navigation.navigate('CreateOrUpdateProduct', {
      product,
    });
  };
  const renderItem = ({ item }: { item: Product }) => {
    return (
      <ProductItem
        data={item}
        onPress={() => {
          pressProductItem(item);
        }}
      />
    );
  };
  const addProductHandler = () => {
    navigation.navigate('CreateOrUpdateProduct');
  };
  useEffect(() => {
    if (isFocused) {
      loadProducts(debouncedQuery);
    }
  }, [isFocused, debouncedQuery]);

  // render logic
  let content = null;
  switch (state.view) {
    case 'DATA':
      content = (
        <FlatList
          data={state.hits}
          renderItem={renderItem}
          keyExtractor={(product) => product.id}
          initialNumToRender={defaultSize}
          ListEmptyComponent={<NotData />}
          ListFooterComponent={<View style={globalStyles.withScreenAir} />}
          style={[{ flex: 1, paddingTop: 5 }, globalStyles.withPadding]}
        />
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
      <Shortcut
        image={addProductImage}
        title="Agregar producto"
        onPress={addProductHandler}
        style={[globalStyles.withMainActionAir, globalStyles.withMargin]}
      />
    </View>
  );
};
