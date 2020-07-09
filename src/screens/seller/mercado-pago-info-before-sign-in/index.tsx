import React from 'react';
import { Image, View } from 'react-native';

// components
import { Container, Text, Icon, Button } from '../../../components';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instances outside component
const mercadoPagoImage = require('../../../../assets/mercado_pago.png');

export interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // event handlers
  const pressSignInHandler = () => {
    navigation.navigate('MercadoPagoSignIn');
  };
  // render logic
  return (
    <Container withMargin style={{ alignItems: 'center' }}>
      <Image
        source={mercadoPagoImage}
        style={{ width: 170, height: 120, marginTop: '25%', marginBottom: 20 }}
      />
      <Text level={2} weight="bold" style={{ marginBottom: 15 }}>
        ¡Bien! casi listo…
      </Text>
      <Text level={5} style={{ lineHeight: 23 }}>
        Solo nos falta un último paso, ingresa o crea una cuenta de{' '}
        <Text level={5} weight="bold">
          Mercado Pago
        </Text>
        .
      </Text>

      <View
        style={[
          { position: 'absolute', bottom: 0, left: 0, right: 0 },
          globalStyles.withMargin,
        ]}
      >
        <View style={{ flexDirection: 'row', marginBottom: 25 }}>
          <Icon
            name="info"
            color={colors.red}
            size={20}
            style={{ marginRight: 10 }}
          />
          <Text level={7} style={{ lineHeight: 17, flex: 1 }}>
            Con{' '}
            <Text level={7} weight="bold">
              Mercado Pago
            </Text>{' '}
            podrás gestionar tus ventas con tarjetas bancarias, retirar
            ganancias, realizar devoluciones y transferencias.
          </Text>
        </View>
        <Button
          title="Ingresar a Mercado Pago"
          onPress={pressSignInHandler}
          style={globalStyles.withMainActionAir}
        />
      </View>
    </Container>
  );
};
