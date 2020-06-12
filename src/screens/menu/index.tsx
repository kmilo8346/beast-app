import React from 'react';
import { ScrollView, View } from 'react-native';

import { Text, ScreenView } from '../../components';
import { Item } from './components';
import globalStyle from '../../styles';
import styles from './styles';

export default () => {
  return (
    <ScreenView safeArea fakeHeader>
      <Text level={1} weight="bold" style={globalStyle.withMargin}>
        Menú
      </Text>
      <ScrollView style={globalStyle.withPadding}>
        <View style={styles.space1} />
        <Item
          name="Cuenta"
          description="Correo, email, medios de pagos, dirección"
          onPress={() => null}
        />
        <Item
          name="Compras"
          description="Historial de compras"
          onPress={() => null}
        />
        <Item
          name="Ayuda"
          description="Preguntas frecuentes, tutoriales"
          onPress={() => null}
        />
        <View style={styles.space2} />
        <Item
          name="Negocio"
          description="Nombre, imagen, horario, despacho"
          onPress={() => null}
        />
        <Item
          name="Ventas"
          description="Historial de ventas"
          onPress={() => null}
        />
        <Item
          name="Mercado Pago"
          description="Retiro de ganancias, devoluciones, transferencias"
          icon="external-link"
          onPress={() => null}
        />
      </ScrollView>
    </ScreenView>
  );
};
