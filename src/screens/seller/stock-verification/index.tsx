import React, { useReducer, useLayoutEffect, ReactNode } from 'react';
import { View, ScrollView, GestureResponderEvent } from 'react-native';

// components
import { Button, Text, Icon } from '../../../components';
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
type ChangeProductConfirmation = {
  type: 'change_product_confirmation';
  productConfirmation: ProductConfirmation;
};
type Action = ToogleEditAction | ChangeProductConfirmation;
type State = {
  edit: boolean;
  confirmation: Confirmation;
};
const reducer = (state: State, action: Action): State => {
  let found: boolean;
  let changes: boolean;
  let products: ProductConfirmation[];
  switch (action.type) {
    case 'toogle_edit':
      return { ...state, edit: !state.edit };
    case 'change_product_confirmation':
      found = false;
      changes = false;
      products = state.confirmation.products.map((product) => {
        if (product.status !== 'partial_stock') {
          changes = true;
        }
        if (product.id === action.productConfirmation.id) {
          found = true;
          return action.productConfirmation;
        }
        return product;
      });
      if (!found) {
        if (action.productConfirmation.status !== 'partial_stock') {
          changes = true;
        }
        products.push(action.productConfirmation);
      }

      return {
        ...state,
        confirmation: {
          ...state.confirmation,
          products,
          changes,
          status:
            state.confirmation.items === products.length
              ? 'finished'
              : 'pending',
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
  const sale: Order = route.params.sale;
  const [state, dispatch] = useReducer(reducer, {
    edit: false,
    confirmation: sale.confirmation || {
      items: sale.transaction.shoppingCart.length,
      products: [],
      changes: false,
      status: 'pending',
    },
  });

  // preconditions
  if (!sale) {
    throw new Error(`${prefix} Sale must be defined`);
  }
  // event handlers
  const pressEditHandler = () => {
    dispatch({ type: 'toogle_edit' });
  };
  const changeConfirmationHandler = (
    productConfirmation: ProductConfirmation
  ) => {
    dispatch({ type: 'change_product_confirmation', productConfirmation });
  };
  const pressContinueHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('SaleDetails', {
      sale: {
        ...sale,
        confirmation: state.confirmation,
      },
    });
  };
  useLayoutEffect(() => {
    let text = 'Editar';
    if (state.edit) {
      text = 'Listo';
    }
    navigation.setOptions({
      headerRight: () => (
        <Button title={text} type="link" onPress={pressEditHandler} />
      ),
    });
  }, [state.edit]);

  // render logic
  const hash: { [key: string]: ProductConfirmation } = {};
  state.confirmation.products.forEach((confirmation) => {
    hash[confirmation.id] = confirmation;
  });
  let continueButton: ReactNode | null = null;
  if (state.confirmation.products.length === state.confirmation.items) {
    continueButton = (
      <Button
        title="Continuemos"
        onPress={pressContinueHandler}
        style={globalStyles.withMainActionAir}
      />
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView
        style={[{ flex: 1, paddingTop: 15 }, globalStyles.withPadding]}
      >
        {sale.transaction.shoppingCart.map((item) => {
          const confirmation = hash[item.id];
          return (
            <Item
              key={item.id}
              product={item}
              confirmation={confirmation}
              editting={state.edit}
              onChangeConfirmation={changeConfirmationHandler}
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
          progress={state.confirmation.products.length}
          goal={state.confirmation.items}
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
            >{`${state.confirmation.products.length} de ${state.confirmation.items}`}</Text>
          </View>

          {continueButton}

          <View
            style={{
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Icon name="phone" color={colors.blue} />
            <Text
              level={6}
              weight="bold"
              color={colors.blue}
              style={{ marginLeft: 5 }}
            >
              Llamar a cliente
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
