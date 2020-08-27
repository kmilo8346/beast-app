import React from 'react';
import { ScrollView, View, Image, GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import Touchable from '../../../components/touchable';
import Text from '../../../components/text';
import ButtonIcon from '../../../components/buttons/button-icon';
// seller components
import DashboardShorcut from '../components/shortcut';
// local components
import DashboardLink from './components/link';
import MercadopagoLink from './components/link-mercadopago';
// types
import { LoggedUser } from '../../../types';
// cache
import userCache from '../../../cache/user';
import storeCache from '../../../cache/store';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

const myProductsImage = require('../../../../assets/icons/tag.png');
const mySalesImage = require('../../../../assets/icons/sale.png');
const addProductOrServiceImage = require('../../../../assets/icons/plus.png');
const salesInProgressImage = require('../../../../assets/icons/clock.png');

// instances outside component
const prefix = '[seller dashboard screen]';

export interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const user = userCache.getData() as LoggedUser;
  // preconditions
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const store = storeCache.getData();
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }
  if (!store.images) {
    throw new Error(`${prefix} Store images must be defined`);
  }
  const insets = useSafeAreaInsets();

  // event handlers
  const pressAddProductHandler = () => {
    navigation.navigate('CreateOrUpdateProduct');
  };

  const pressSelectOrCreateStoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.replace('SelectOrCreateStore');
  };

  // render logic
  const image = store.images[0];
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.white,
        paddingTop: insets.top,
      }}
    >
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
              navigation.navigate('UpdateStoreInfo');
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
                  weight="bold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ marginBottom: 2, marginRight: 3 }}
                >
                  {store.name}
                </Text>
              </View>
              <Text level={5} color={colors.blackLight2}>
                Editar datos de tienda
              </Text>
            </View>
          </Touchable>
          <ButtonIcon
            icon="repeat"
            style={{ alignSelf: 'center' }}
            onPress={pressSelectOrCreateStoreHandler}
          />
        </View>

        <MercadopagoLink />

        <DashboardLink
          image={myProductsImage}
          title="Mis productos"
          onPress={() => {
            navigation.navigate('MyProducts', { type: 'product' });
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
          title="Agregar producto"
          onPress={pressAddProductHandler}
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
    </View>
  );
};
