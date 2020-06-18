import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { View, Image } from 'react-native';

import {
  Container,
  Text,
  InputNumber,
  Button,
  ButtonCart,
  ButtonContact,
} from '../../components';
import numberFormatter from '../../lib/formatters/number-formatter';
import Cart from '../../containers/cart';
import globalStyle from '../../styles';
import colors from '../../styles/colors';

export interface PDPScreenProps {
  route: any;
}

export default ({ route }: PDPScreenProps) => {
  const cartContainer = Cart.useContainer();

  // getting qty from cart
  const product = {
    ...route.params,
    qty: cartContainer.getItemQty(route.params),
  };

  // reendering logic
  let format = null;
  let priceSection = (
    <Text style={{ marginTop: 15 }} level={2}>
      {product.price
        ? numberFormatter.toCurrency(product.price)
        : 'Precio a convenir'}
    </Text>
  );
  let mainAction: JSX.Element | null = (
    <ButtonContact phone={product.store.phone} />
  );
  if (product.type === 'product') {
    format = (
      <Text
        level={2}
        color={colors.blackLight1}
        style={{ marginLeft: 3, marginTop: 10 }}
      >{`${product.format} · ${numberFormatter.toCurrency(
        product.price
      )}`}</Text>
    );
    mainAction = (
      <Button
        title="Agregar"
        onPress={() => {
          cartContainer.setItem({ ...product, qty: 1 });
        }}
      />
    );
    if (product.qty) {
      priceSection = (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 25,
          }}
        >
          <InputNumber
            showValue
            type="dark"
            value={product.qty}
            onChange={(value) => {
              cartContainer.setItem({ ...product, qty: value });
            }}
          />
          <Text level={2}>
            {numberFormatter.toCurrency(
              product.qty * (product.price as number)
            )}
          </Text>
        </View>
      );
      mainAction = null;
    }
  }

  return (
    <Container style={{ position: 'relative' }}>
      <ScrollView style={[globalStyle.withPadding]}>
        <View
          style={{
            alignSelf: 'center',
            width: 240,
            height: 216,
            borderRadius: 7,
          }}
        >
          <Image
            source={{ uri: product.images[0] }}
            style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
          />
        </View>
        <Text weight="bold" style={{ marginTop: 17 }}>
          {product.name}
        </Text>
        {format}
        {priceSection}
        <Text level={6} weight="bold" style={{ marginTop: 20 }}>
          Descripción
        </Text>
        <Text level={6} style={{ marginTop: 5 }}>
          {product.description}
        </Text>
        <View style={globalStyle.withCartSpace} />
      </ScrollView>
      <View
        style={[
          { position: 'absolute', bottom: 0, left: 0, right: 0 },
          globalStyle.withPadding,
          globalStyle.withMainActionAir,
        ]}
      >
        {mainAction}
      </View>
    </Container>
  );
};
