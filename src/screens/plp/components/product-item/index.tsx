import React, { useState } from 'react';
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
import { Product } from '../../../../types';
import numberFormatter from '../../../../lib/formatters/number-formatter';
import colors from '../../../../styles/colors';
import styles from './styles';

export interface ProductItemProps {
  data: Product;
  style?: StyleProp<ViewStyle>;
  onChange: (product: Product) => void;
  onSeeDetail: (product: Product) => void;
}

export default ({
  data,
  style = {},
  onChange,
  onSeeDetail,
}: ProductItemProps) => {
  const [qty, setQty] = useState(data.qty);
  const containerStyle = [styles.container, style];

  const { type, name, description, images, price, brand, format } = data;

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
        onSeeDetail(data);
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
          setQty(qty);
          onChange({ ...data, qty });
        }}
        style={styles.action}
      />
    );
  }

  return (
    <Touchable
      style={containerStyle}
      onPress={(event: GestureResponderEvent) => {
        event.stopPropagation();
        onSeeDetail(data);
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
