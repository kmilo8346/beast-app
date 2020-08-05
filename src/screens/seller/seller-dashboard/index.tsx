import React, { useReducer } from 'react';
import { ScrollView, View, Image, ImageBackground } from 'react-native';

// components
import {
  Container,
  Touchable,
  Text,
  Icon,
  ButtonIcon,
} from '../../../components';
// seller components
import { Shortcut as DashboardShorcut } from '../components';
// local components
import { Link as DashboardLink, ModalSelectProductType } from './components';
// containers
import UserProvider from '../../../containers/user';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

const bgAcumuladoImage = require('../../../../assets/bg-acumulado.png');
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
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();
  // preconditions
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const store = user.store;
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }
  if (!store.images) {
    throw new Error(`${prefix} Store images must be defined`);
  }
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
  const image = store.images[0];
  return (
    <Container safeArea>
      <ScrollView style={[globalStyles.withPadding]}>
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 10,
          }}
        >
          <Touchable
            style={{
              flexDirection: 'row',
              flex: 1,
            }}
            onPress={() => {
              // console.log('mi tienda clicked');
              navigation.navigate('UpdateStoreInfoScreen');
            }}
          >
            <Image
              source={{ uri: image }}
              style={{
                height: 50,
                width: 50,
                borderRadius: 30,
              }}
            />
            <View
              style={{
                marginLeft: 15,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                }}
              >
                <Text
                  level={2}
                  style={{ marginBottom: 2, marginRight: 3 }}
                  weight="bold"
                >
                  Mi tienda
                </Text>
                <Icon name="chevron-down" />
              </View>
              <Text level={5} color={colors.blackLight2}>
                Editar datos de tienda
              </Text>
            </View>
          </Touchable>
          <ButtonIcon
            icon="bell"
            style={{ alignSelf: 'center' }}
            onPress={() => null}
          />
        </View>
        <Touchable onPress={() => null}>
          <ImageBackground
            source={bgAcumuladoImage}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              height: 100,
              marginBottom: 20,
              borderRadius: 13,
              paddingLeft: 20,
            }}
          >
            <View style={{ flex: 5 }}>
              <Text level={1} weight="bold" color={colors.white}>
                Hola Camilo
              </Text>
              <Text level={5} color={colors.white}>
                Productos vendidos en total
              </Text>
            </View>
            <Text
              style={{ flex: 1 }}
              level={1}
              weight="bold"
              color={colors.white}
            >
              7
            </Text>
          </ImageBackground>
        </Touchable>
        <DashboardLink
          image={myProductsImage}
          title="Mis productos"
          onPress={() => {
            navigation.navigate('MyProducts', { type: 'product' });
          }}
        />
        <DashboardLink
          image={myServicesImage}
          title="Mis servicios"
          onPress={() => {
            navigation.navigate('MyProducts', { type: 'service' });
          }}
        />
        <DashboardLink
          image={mySalesImage}
          title="Mis ventas"
          onPress={() => {
            navigation.navigate('MySales', { view: 'HISTORICAL' });
          }}
        />
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
          onPress={() => {
            navigation.navigate('MySales', { view: 'IN_PROGRESS' });
          }}
        />
      </View>
      {selectProductTypeModal}
    </Container>
  );
};
