import React, { useEffect, useState, memo } from 'react';
import { Dimensions, GestureResponderEvent, View, Image } from 'react-native';

// components
import Touchable from '../../../components/touchable';
import Text from '../../../components/text';
import Badge from '../../../components/badge';
// local components
import InputNumber from './components/input-number';
// lib
import cloudinary from '../../../lib/cloudinary';
import numberFormatter from '../../../lib/formatters/number-formatter';
// cache
import shoppingCartCache from '../../../cache/shopping-cart';
// types
import { Product, Store } from '../../../types';

interface ComponentProps {
  store: Store;
  product: Product;
  align: 'left' | 'right';
  onPress: (product: Product) => void;
}

export default memo(({ product, store, align, onPress }: ComponentProps) => {
  // state
  const [qty, setQty] = useState<number | undefined>();

  // event handlers
  const pressProductHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress(product);
  };

  const changeQtyHandler = (qty: number) => {
    shoppingCartCache.set(store, product, qty);
  };

  useEffect(() => {
    const unsubscribe = shoppingCartCache.onChangeItem(
      store.id,
      product.id,
      (data) => {
        setQty(data?.qty || 0);
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  // render logic
  const size = (Dimensions.get('window').width / 2 - 20) * 0.95;
  return (
    <View style={{ width: '50%', marginBottom: 10 }}>
      <Touchable onPress={pressProductHandler} style={{ marginBottom: 3 }}>
        <View
          style={{ alignSelf: align === 'right' ? 'flex-end' : 'flex-start' }}
        >
          {!!qty && (
            <View style={{ zIndex: 9, position: 'absolute', left: 2, top: 2 }}>
              <Badge count={qty} style={{ minHeight: 24, minWidth: 24 }} />
            </View>
          )}
          <Image
            source={{
              uri: cloudinary.dynamicUrl(product.images[0], 'h_500'),
            }}
            style={[
              {
                borderRadius: 8,
                width: size,
                height: size,
              },
            ]}
          />
        </View>
        <View
          style={{
            width: size,
            alignSelf: align === 'right' ? 'flex-end' : 'flex-start',
            paddingTop: 5,
            minHeight: 55,
          }}
        >
          <Text
            level={7}
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{ marginLeft: 5, marginBottom: 2 }}
          >
            {product.name}
          </Text>
          <Text level={7} weight="bold" style={{ marginLeft: 5 }}>
            {numberFormatter.toCurrency(product.price)}
          </Text>
        </View>
      </Touchable>
      {typeof qty !== 'undefined' && !!store.reference && (
        <View style={{ minHeight: 30 }}>
          <InputNumber
            value={qty}
            style={{ alignSelf: 'center' }}
            onChange={changeQtyHandler}
          />
        </View>
      )}
    </View>
  );
});
