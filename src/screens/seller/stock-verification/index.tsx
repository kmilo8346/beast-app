import React, { useReducer, useLayoutEffect } from 'react';
import { View, ScrollView, GestureResponderEvent } from 'react-native';

// components
import { Button, Text } from '../../../components';
// local components
import { Item, ProgressBar } from './components';
// types
import { Confirmation, Order, ProductConfirmation } from '../../../types';
// syles
import colors from '../../../styles/colors';
import globalStyles from '../../../styles';

// instances outside component
const prefix = '[stock verification screen]';

type ToogleEditAction = {
  type: 'toogle_edit';
};
type ChangeProductConfirmationAction = {
  type: 'change_product_confirmation';
  productConfirmation: ProductConfirmation;
};
type RevertProductConfirmationAction = {
  type: 'revert_product_confirmation';
  productConfirmation: ProductConfirmation;
};
type Action =
  | ToogleEditAction
  | ChangeProductConfirmationAction
  | RevertProductConfirmationAction;
type State = {
  editting: boolean;
  confirmation: Confirmation;
};
const reducer = (state: State, action: Action): State => {
  let found: boolean;
  let confirmation: Confirmation;
  switch (action.type) {
    case 'toogle_edit':
      return { ...state, editting: !state.editting };
    case 'change_product_confirmation':
      found = false;
      confirmation = state.confirmation.map((productConfirmation) => {
        if (productConfirmation.id === action.productConfirmation.id) {
          found = true;
          return action.productConfirmation;
        }
        return productConfirmation;
      });
      if (!found) {
        confirmation.push(action.productConfirmation);
      }
      return {
        ...state,
        confirmation,
      };
    case 'revert_product_confirmation':
      return {
        ...state,
        confirmation: state.confirmation.filter(
          (productConfirmation) =>
            productConfirmation.id !== action.productConfirmation.id
        ),
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
  const sale: Order = route.params.sale;
  const [state, dispatch] = useReducer(reducer, {
    editting: false,
    confirmation: sale.provider.confirmation || [],
  });

  // preconditions
  if (!sale) {
    throw new Error(`${prefix} Sale must be defined`);
  }
  // event handlers
  const pressEditHandler = () => {
    dispatch({ type: 'toogle_edit' });
  };
  const changeProductConfirmationHandler = (
    productConfirmation: ProductConfirmation
  ) => {
    dispatch({ type: 'change_product_confirmation', productConfirmation });
  };
  const revertProductConfirmationHandler = (
    productConfirmation: ProductConfirmation
  ) => {
    dispatch({ type: 'revert_product_confirmation', productConfirmation });
  };
  const pressContinueHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('SaleDetails', {
      sale: {
        ...sale,
        provider: {
          ...sale.provider,
          confirmation: state.confirmation,
        },
      },
    });
  };
  useLayoutEffect(() => {
    let text = 'Editar';
    if (state.editting) {
      text = 'Listo';
    }
    navigation.setOptions({
      headerRight: () => (
        <Button title={text} type="link" onPress={pressEditHandler} />
      ),
    });
  }, [state.editting]);

  // render logic
  const hash: { [key: string]: ProductConfirmation } = {};
  state.confirmation.forEach((productConfirmation) => {
    hash[productConfirmation.id] = productConfirmation;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView
        style={[{ flex: 1, paddingTop: 15 }, globalStyles.withPadding]}
      >
        {sale.transaction.shopping_cart.map((item) => {
          const confirmation = hash[item.id];
          return (
            <Item
              key={item.id}
              product={item}
              productConfirmation={confirmation}
              editting={state.editting}
              onChangeProductConfirmation={changeProductConfirmationHandler}
              onRevertProductConfirmation={revertProductConfirmationHandler}
            />
          );
        })}
      </ScrollView>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <ProgressBar
          progress={state.confirmation.length}
          goal={sale.transaction.shopping_cart.length}
          style={{ marginBottom: 10 }}
        />
        <View style={globalStyles.withMargin}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <Text level={4} weight="bold">
              Llevas
            </Text>
            <Text
              level={4}
              weight="bold"
            >{`${state.confirmation.length} de ${sale.transaction.shopping_cart.length}`}</Text>
          </View>

          <Button
            title="Continuemos"
            disabled={
              state.confirmation.length < sale.transaction.shopping_cart.length
            }
            style={globalStyles.withMainActionAir}
            onPress={pressContinueHandler}
          />
        </View>
      </View>
    </View>
  );
};
