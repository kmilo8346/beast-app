import React, { useReducer } from 'react';
import { View, Keyboard, TouchableWithoutFeedback } from 'react-native';

// components
import {
  Container,
  FlatList,
  Text,
  Loading,
  ErrorView,
} from '../../../components';
// local components
import { ProductItem } from './components';
// types
import { Product } from '../../../types';
// styles
import globalStyles from '../../../styles';

// instances outside component
type MyProductsView = 'LOADING' | 'DATA' | 'ERROR';
type ChangeViewAction = {
  type: 'change_view';
  view: MyProductsView;
};
type ChangeQueryAction = {
  type: 'change_query';
  query: string;
};
type Action = ChangeViewAction | ChangeQueryAction;
type State = {
  view: MyProductsView;
  query: string;
  from: 0;
  total: 0;
  products: Product[];
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_view':
      return { ...state, view: action.view };
    case 'change_query':
      return { ...state, query: action.query };
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
    query: '',
    from: 0,
    total: 0,
    products: [],
  });
  // event handlers
  const renderItem = ({ item }: { item: Product }) => {
    return <ProductItem data={item} />;
  };

  // render logic
  let content = null;
  switch (state.view) {
    case 'DATA':
      content = (
        <FlatList
          data={state.products}
          renderItem={renderItem}
          keyExtractor={(product) => product.id}
          ListEmptyComponent={
            <View>
              <Text level={7}>No hay productos publicados</Text>
            </View>
          }
          style={[globalStyles.withPadding]}
        />
      );
      break;
    case 'ERROR':
      content = (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ErrorView />
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
    <Container safeArea fakeHeader>
      {content}
    </Container>
  );
};
