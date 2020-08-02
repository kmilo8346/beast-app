import React, { ReactNode } from 'react';
import { View } from 'react-native';

// components
import { Text } from '../../../../../components';
// libs
import numberFormatter from '../../../../../lib/formatters/number-formatter';
// types
import {
  Item,
  ProductConfirmation,
  ProductConfirmationType,
} from '../../../../../types';
// styles
import colors from '../../../../../styles/colors';

export interface ItemProps {
  product: Item;
  productConfirmation?: ProductConfirmation;
}

export default ({ product, productConfirmation }: ItemProps) => {
  // render logic
  let badgeColor = colors.blackLight4;
  if (
    productConfirmation &&
    productConfirmation.type === ProductConfirmationType.UPDATE
  ) {
    badgeColor = colors.redLight2;
    if (productConfirmation.qtyPosible >= 1) {
      badgeColor = colors.yellow;
    }
    if (productConfirmation.qtyPosible === product.qty) {
      badgeColor = colors.green2;
    }
  }
  let label: ReactNode | null = null;
  if (productConfirmation) {
    let text = 'Eliminado';
    let containerColor = colors.blackLight5;
    let textColor = colors.black;
    if (productConfirmation.type === ProductConfirmationType.UPDATE) {
      text = 'Sin stock';
      containerColor = colors.redLight3;
      textColor = colors.redLight2;
      if (productConfirmation.qtyPosible === product.qty) {
        text = ``;
      } else if (productConfirmation.qtyPosible >= 1) {
        text = `Se entregará ${productConfirmation.qtyPosible} de ${product.qty}`;
        containerColor = colors.yellowLight2;
        textColor = colors.yellow;
      }
    }
    if (text) {
      label = (
        <View
          style={{
            marginLeft: 10,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 5,
            backgroundColor: containerColor,
            alignSelf: 'flex-start',
            marginTop: 7,
          }}
        >
          <Text level={6} color={textColor}>
            {text}
          </Text>
        </View>
      );
    }
  }
  return (
    <View
      key={product.id}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
      }}
    >
      <View
        style={{
          borderWidth: 2,
          borderColor: badgeColor,
          borderRadius: 4,
          paddingVertical: 3,
          paddingHorizontal: 5,
          minWidth: 25,
          minHeight: 25,
          alignItems: 'center',
        }}
      >
        <Text level={6} color={badgeColor}>
          {product.qty}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          level={6}
          numberOfLines={2}
          ellipsizeMode="tail"
          style={{ flex: 1, marginLeft: 10 }}
        >
          {product.name}
        </Text>
        {label}
      </View>

      <Text level={6} style={{ marginLeft: 10 }}>
        {numberFormatter.toCurrency(product.qty * product.price)}
      </Text>
    </View>
  );
};
