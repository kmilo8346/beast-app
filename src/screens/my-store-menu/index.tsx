import React from 'react';
import { GestureResponderEvent, View } from 'react-native';

// local components
import Item from './components/item';
// cache
import storeCache from '../../cache/store';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component

interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // event handlers
  const pressEditStoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    const store = storeCache.getData();
    navigation.navigate('SellerStack', {
      screen: 'UpsertStore',
      params: { store },
    });
  };

  const pressMySalesHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('SellerStack', {
      screen: 'Sales',
    });
  };

  // render logic
  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.white },
        globalStyles.withPadding,
      ]}
    >
      <Item
        name="Editar tienda"
        description="Imagen, horario, despacho"
        onPress={pressEditStoreHandler}
      />
      <Item
        name="Mis ventas"
        description="Histórico de ventas"
        onPress={pressMySalesHandler}
      />
    </View>
  );
};
