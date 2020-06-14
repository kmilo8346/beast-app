import React from 'react';
import {
  View,
  Image,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';

import {
  Text,
  FriendlyInputNumber,
  ButtonSmall,
  Touchable,
} from '../../../../components';
import Badge from '../badge';
import Cart from '../../../../containers/cart';
import { Product } from '../../../../types';
import numberFormatter from '../../../../lib/formatters/number-formatter';
import colors from '../../../../styles/colors';
import styles from './styles';

export interface ProductItemProps {
  data: Product;
  style?: StyleProp<ViewStyle>;
  onSeeDetail: (product: Product) => void;
}

export default ({ data, style = {}, onSeeDetail }: ProductItemProps) => {
  const cartContainer = Cart.useContainer();

  const { type, name, description, images, price, brand, format } = data;
  const qty = cartContainer.getItemQty(data);

  let pName = name;
  let pDescription = description;
  const pImage = images.length ? images[0] : undefined;
  let pPrice: any = price ? numberFormatter.toCurrency(price) : 'A convenir';
  let pBadge = null;
  let action = (
    <ButtonSmall
      title="Ver"
      style={styles.action}
      onPress={(event: GestureResponderEvent) => {
        event.stopPropagation();
        onSeeDetail({ ...data, qty });
      }}
    />
  );
  if (type === 'product') {
    pBadge = qty > 0 ? <Badge count={qty} style={styles.badge} /> : null;
    pName = brand ? `${brand} · ${name}` : name;
    pDescription = format
      ? `${format} · ${numberFormatter.toCurrency(price)}`
      : numberFormatter.toCurrency(price);
    pPrice = qty > 0 ? (price as number) * qty : price;
    pPrice = numberFormatter.toCurrency(pPrice);
    action = (
      <FriendlyInputNumber
        value={qty}
        onChange={(qty) => {
          cartContainer.setItem({ ...data, qty });
        }}
        style={styles.action}
      />
    );
  }
  const containerStyle = [styles.container, style];
  return (
    <Touchable
      style={containerStyle}
      onPress={(event: GestureResponderEvent) => {
        event.stopPropagation();
        onSeeDetail({ ...data, qty });
      }}
    >
      <View style={styles.leftContainer}>
        <Image source={{ uri: pImage }} style={styles.image} />
        {pBadge}
      </View>
      <View style={styles.centerContainer}>
        <Text
          level={7}
          style={styles.name}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {pName}
        </Text>
        <Text
          level={7}
          color={colors.blackLight3}
          style={styles.description}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {pDescription}
        </Text>
      </View>
      <View style={styles.rightContainer}>
        <Text level={7} style={styles.price}>
          {pPrice}
        </Text>
        {action}
      </View>
    </Touchable>
  );
};
