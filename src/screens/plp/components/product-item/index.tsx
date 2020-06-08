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
import { Item, ServiceItem, ProductItem } from '../../../../types';
import numberFormatter from '../../../../lib/formatters/number-formatter';
import colors from '../../../../styles/colors';
import styles from './styles';

export interface ProductItemProps {
  data: Item;
  style?: StyleProp<ViewStyle>;
  onChange: (item: Item) => void;
  onSeeDetail: (item: Item) => void;
}

export default ({
  data,
  style = {},
  onChange,
  onSeeDetail,
}: ProductItemProps) => {
  const image = data.images[0];
  const containerStyle = [styles.container, style];
  if (data.type === 'service') {
    const service: ServiceItem = data;
    const price = service.price
      ? numberFormatter.toCurrency(service.price)
      : 'A convenir';
    return (
      <Touchable
        style={containerStyle}
        onPress={(event: GestureResponderEvent) => {
          event.stopPropagation();
          onSeeDetail(service);
        }}
      >
        <View style={styles.leftContainer}>
          <Image source={image} style={styles.image} />
        </View>
        <View style={styles.centerContainer}>
          <Text
            level={7}
            style={styles.name}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {service.name}
          </Text>
          <Text
            level={7}
            color={colors.blackLight3}
            style={styles.description}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {service.description}
          </Text>
        </View>
        <View style={styles.rightContainer}>
          <Text level={7} style={styles.price}>
            {price}
          </Text>
          <ButtonSmall
            title="Ver"
            style={styles.action}
            onPress={(event: GestureResponderEvent) => {
              event.stopPropagation();
              onSeeDetail(service);
            }}
          />
        </View>
      </Touchable>
    );
  }

  const product: ProductItem = data as ProductItem;
  const name = product.brand
    ? `${product.brand} · ${product.name}`
    : product.name;
  const description = `${product.format} · ${numberFormatter.toCurrency(
    product.price
  )}`;
  const price = product.qty > 0 ? product.price * product.qty : product.price;
  return (
    <Touchable
      style={containerStyle}
      onPress={(event: GestureResponderEvent) => {
        event.stopPropagation();
        onSeeDetail(product);
      }}
    >
      <View style={styles.leftContainer}>
        <Image source={image} style={styles.image} />
        {product.qty > 0 && <Badge count={product.qty} style={styles.badge} />}
      </View>
      <View style={styles.centerContainer}>
        <Text
          level={7}
          style={styles.name}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {name}
        </Text>
        <Text
          level={7}
          color={colors.blackLight3}
          style={styles.description}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {description}
        </Text>
      </View>
      <View style={styles.rightContainer}>
        <Text level={7} style={styles.price}>
          {numberFormatter.toCurrency(price)}
        </Text>
        <FriendlyInputNumber
          value={product.qty}
          onChange={(qty) => {
            onChange({ ...product, qty });
          }}
          style={styles.action}
        />
      </View>
    </Touchable>
  );
};
