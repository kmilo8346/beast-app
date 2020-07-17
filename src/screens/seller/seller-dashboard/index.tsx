/* eslint-disable global-require */
import React, { useReducer } from 'react';
import { ScrollView, View } from 'react-native';

// components
import { Container } from '../../../components';
// seller components
import { Shortcut as DashboardShorcut } from '../components';
// local components
import { Link as DashboardLink, ModalSelectProductType } from './components';
// styles
import globalStyles from '../../../styles';

const myProductsImage = require('../../../../assets/icons/tag.png');
const myServicesImage = require('../../../../assets/icons/hand_shake.png');
const mySalesImage = require('../../../../assets/icons/sale.png');
const addProductOrServiceImage = require('../../../../assets/icons/plus.png');
const salesInProgressImage = require('../../../../assets/icons/clock.png');

// instances outside component

const prefix = '[seller dashboard screen]';
type ShowSelectProductTypeModalAction = {
  type: 'show_select_product_type_modal';
};
type HideSelectProductTypeModalAction = {
  type: 'hide_select_product_type_modal';
};

type Action =
  | ShowSelectProductTypeModalAction
  | HideSelectProductTypeModalAction;

type State = {
  selectProductTypeModalIsVisible: boolean;
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'show_select_product_type_modal':
      return { ...state, selectProductTypeModalIsVisible: true };
    case 'hide_select_product_type_modal':
      return { ...state, selectProductTypeModalIsVisible: false };
    default:
      return state;
  }
};

export interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    selectProductTypeModalIsVisible: false,
  });

  // render logic
  let selectProductTypeModal = null;
  if (state.selectProductTypeModalIsVisible) {
    selectProductTypeModal = (
      <ModalSelectProductType
        onRequestClose={() => {
          dispatch({ type: 'hide_select_product_type_modal' });
        }}
        onSelect={(type) => {
          dispatch({ type: 'hide_select_product_type_modal' });
          switch (type) {
            case 'product':
              navigation.navigate('CreateOrUpdateProduct');
              break;
            case 'service':
              navigation.navigate('CreateOrUpdateService');
              break;
            default:
              throw new Error(`${prefix} Invalid on select type`);
          }
        }}
      />
    );
  }
  return (
    <Container safeArea>
      <ScrollView style={[globalStyles.withPadding]}>
        <DashboardLink
          image={myProductsImage}
          title="Mis productos"
          onPress={() => {
            navigation.navigate('MyProducts');
          }}
        />
        <DashboardLink image={myServicesImage} title="Mis servicios" />
        <DashboardLink image={mySalesImage} title="Mis ventas" />
      </ScrollView>
      <View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
          globalStyles.withMargin,
        ]}
      >
        <DashboardShorcut
          image={addProductOrServiceImage}
          title="Agregar producto o servicio"
          onPress={() => {
            dispatch({ type: 'show_select_product_type_modal' });
          }}
          style={{ marginBottom: 12 }}
        />
        <DashboardShorcut
          image={salesInProgressImage}
          title="Ventas en curso"
          style={{ marginBottom: 12 }}
        />
      </View>
      {selectProductTypeModal}
    </Container>
  );
};
