import React from 'react';
import { View } from 'react-native';
import * as Linking from 'expo-linking';

// components
import Text from '../../../../../components/text';
import Touchable from '../../../../../components/touchable';
import Icon from '../../../../../components/icon';
import MercadopagoSmallLogo from '../../../../../components/svgs/icons/mercadopago-small-logo';
import colors from '../../../../../styles/colors';

export default () => {
  // event handlers
  const pressHandler = async () => {
    try {
      await Linking.openURL('mercadopago://');
    } catch (error) {
      // TODO: log errors
      console.log(error);

      Linking.openURL('https://mercadopago.com');
    }
  };

  // render logic
  return (
    <Touchable onPress={pressHandler}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.blackLight6,
          borderRadius: 13,
          paddingVertical: 12,
          paddingHorizontal: 15,
          marginBottom: 12,
          marginTop: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <MercadopagoSmallLogo />
            <Text level={5} weight="bold" style={{ flex: 1, marginLeft: 10 }}>
              Ir a Mercado Pago
            </Text>
          </View>
          <Text level={7} style={{ flex: 1, marginTop: 2 }}>
            Retiro de ganancias, devoluciones, transferencias.
          </Text>
        </View>
        <Icon name="chevron-right" size={20} />
      </View>
    </Touchable>
  );
};
