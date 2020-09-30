import React, { useReducer, useLayoutEffect } from 'react';
import { View, ScrollView, GestureResponderEvent } from 'react-native';

// components
import Button from '../../../components/buttons/button';
import Text from '../../../components/text';
// local components
import Item from './components/item';
import ProgressBar from './components/progress-bar';
// libs
import * as utils from '../../../lib/utils';
// types
import {
  Confirmation,
  Order,
  ProductConfirmation,
  ConfirmationStatus,
  ProductConfirmationType,
} from '../../../types';
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
  switch (action.type) {
    case 'toogle_edit':
      return { ...state, editting: !state.editting };
    case 'change_product_confirmation':
      return {
        ...state,
        confirmation: {
          ...state.confirmation,
          product_confirmations: utils.replaceOrAdd(
            state.confirmation.product_confirmations,
            action.productConfirmation,
            (pc1, pc2) => pc1.id === pc2.id
          ),
        },
      };
    case 'revert_product_confirmation':
      return {
        ...state,
        confirmation: {
          ...state.confirmation,
          product_confirmations: state.confirmation.product_confirmations.filter(
            (pc) => pc.id !== action.productConfirmation.id
          ),
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
    editting: false,
    confirmation: sale.dispatch_provider.confirmation || {
      status: ConfirmationStatus.FULL_STOCK,
      product_confirmations: [],
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
    // determining confirmation state
    const totalInOrder = sale.transaction.shopping_cart.reduce(
      (total, item) => total + item.qty,
      0
    );
    const totalInConfirmation = state.confirmation.product_confirmations.reduce(
      (total, pc) => {
        if (pc.type === ProductConfirmationType.UPDATE) {
          return total + pc.qty_posible;
        }
        return total;
      },
      0
    );
    let status: ConfirmationStatus = ConfirmationStatus.FULL_STOCK;
    if (totalInConfirmation <= 0) {
      status = ConfirmationStatus.OUT_OF_STOCK;
    } else if (totalInConfirmation >= totalInOrder) {
      status = ConfirmationStatus.FULL_STOCK;
    } else {
      status = ConfirmationStatus.PARTIAL_STOCK;
    }
    const confirmation = {
      ...state.confirmation,
      status,
    };
    navigation.navigate('OwnerSaleDetails', {
      sale: {
        ...sale,
        dispatch_provider: {
          ...sale.dispatch_provider,
          confirmation,
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
  state.confirmation.product_confirmations.forEach((pc) => {
    hash[pc.id] = pc;
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
          progress={state.confirmation.product_confirmations.length}
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
            >{`${state.confirmation.product_confirmations.length} de ${sale.transaction.shopping_cart.length}`}</Text>
          </View>

          <Button
            title="Continuemos"
            disabled={
              state.confirmation.product_confirmations.length <
              sale.transaction.shopping_cart.length
            }
            style={globalStyles.withMainActionAir}
            onPress={pressContinueHandler}
          />
        </View>
      </View>
    </View>
  );
};
