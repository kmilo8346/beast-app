import React, { useState, useEffect } from 'react';
import { ScrollView, View, Image, GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import Text from '../../../../components/text';
import Divider from '../../../../components/divider';
import Button from '../../../../components/buttons/button';
// store components
import FullModal, { FullModalProps } from '../full-modal';
// local components
import NumberInput from './components/number-input';
// cache
import shoppingCartsCache from '../../../../cache/shopping-carts';
import ShoppingCartCache from '../../../../cache/shopping-cart';
// libs
import numberFormatter from '../../../../lib/formatters/number-formatter';
import cloudinary from '../../../../lib/cloudinary';
// types
import { Product } from '../../../../types';
// styles
import globalStyles from '../../../../styles';

interface ComponentProps extends Omit<FullModalProps, 'children'> {
  product: Product;
}

export default ({ product, ...otherProps }: ComponentProps) => {
  // state
  const [cache, setCache] = useState<ShoppingCartCache | null>(null);
  const [qty, setQty] = useState(1);
  const insets = useSafeAreaInsets();

  // event handler
  const instanceCache = async () => {
    const shoppingCartCache = await shoppingCartsCache.get(product.store);
    setCache(shoppingCartCache);
  };

  const qtyChangeHandler = (qty: number) => {
    setQty(qty);
  };

  const pressAddHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    if (cache) {
      cache.add(product, qty);
      otherProps.onClose && otherProps.onClose();
    }
  };

  useEffect(() => {
    instanceCache();
  }, []);

  // render logic
  const image = product.images[0];
  return (
    <FullModal {...otherProps}>
      <ScrollView style={{ flex: 1 }}>
        <View style={[{ paddingTop: 7 }, globalStyles.withMargin]}>
          <Image
            source={{ uri: cloudinary.dynamicUrl(image, 'h_234') }}
            style={{
              width: '100%',
              height: 234,
              borderRadius: 9,
              marginBottom: 20,
            }}
          />

          <Text
            level={4}
            weight="bold"
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{ marginBottom: 5 }}
          >
            {product.name}
          </Text>
          <Text level={6} style={{ marginBottom: 30, lineHeight: 20 }}>
            {product.description}
            {` `}
            <Text level={6} weight="bold">
              {numberFormatter.toCurrency(product.price)}
            </Text>
          </Text>
        </View>

        <Divider type="thick" />

        <View style={{ alignItems: 'center', paddingTop: 30 }}>
          <NumberInput value={qty} onChange={qtyChangeHandler} />
        </View>

        <View style={globalStyles.withScreenAir} />
      </ScrollView>

      <View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingBottom: insets.bottom,
          },
          globalStyles.withMargin,
        ]}
      >
        <Button
          title={`Agrega ${qty} al carrito. ·${numberFormatter.toCurrency(
            qty * product.price
          )}`}
          style={globalStyles.withMainActionAir}
          onPress={pressAddHandler}
        />
      </View>
    </FullModal>
  );
};
