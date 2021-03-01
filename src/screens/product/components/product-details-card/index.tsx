import React, { useEffect, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
// product components
import NumberInput from '../number-input';
// screen components
import Carousell from './components/carousell';
// components
import Text from '../../../../components/text';
import ReadMore from '../../../../components/text/read-more';
// lib
import * as utils from '../../../../lib/utils';
import cloudinary from '../../../../lib/cloudinary';
import numberFormatter from '../../../../lib/formatters/number-formatter';
// cache
import shoppingCartCache from '../../../../cache/shopping-cart';
// types
import { Product, Store } from '../../../../types';
// styles
import globalStyles from '../../../../styles';

interface ComponentProps {
  store?: Store;
  product: Product;
  style?: StyleProp<ViewStyle>;
}

export default ({ store, product, style }: ComponentProps) => {
  // state
  const [qty, setQty] = useState<number | undefined>();

  // event handlers

  const changeQtyHandler = (qty: number) => {
    shoppingCartCache.set(store as Store, product, qty);
  };

  useEffect(() => {
    let unsubscribe: () => void = utils.noop;
    if (store) {
      unsubscribe = shoppingCartCache.onChangeItem(
        store.id,
        product.id,
        (data) => {
          setQty(data?.qty || 0);
        }
      );
    }

    return () => {
      unsubscribe();
    };
  }, [store]);

  // render logic
  return (
    <View style={style}>
      <Carousell
        images={product.images.map((image: string) =>
          cloudinary.dynamicUrl(image, 'h_500/q_80')
        )}
      />
      {!!store && (
        <View style={{ marginTop: 10, marginBottom: 10 }}>
          <View style={globalStyles.withMargin}>
            {!!product.name && !!product.price && (
              <Text level={3} weight="bold" style={{ marginBottom: 5 }}>
                {`${product.name} · `}
                <Text level={3} weight="normal">
                  {numberFormatter.toCurrency(product.price)}
                </Text>
              </Text>
            )}
            {!!product.description && (
              <View style={{ marginBottom: 5 }}>
                <ReadMore
                  level={6}
                  numberOfLines={3}
                  style={{ lineHeight: 18 }}
                >
                  {product.description}
                </ReadMore>
              </View>
            )}
          </View>
          {typeof qty !== 'undefined' && !!store.phone && (
            <View style={{ minHeight: 45, marginTop: 10, marginBottom: 10 }}>
              <NumberInput
                value={qty}
                style={{ alignSelf: 'center' }}
                onChange={changeQtyHandler}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};
