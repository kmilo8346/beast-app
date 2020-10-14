import React, { useEffect, useState } from 'react';
import {
  GestureResponderEvent,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { Product, Store } from '../../../../types';

// components
import Text from '../../../../components/text';
import Touchable from '../../../../components/touchable';
import Icon from '../../../../components/icon';
// screen components
import Carousell from '../../../components/carousell';
// product components
import NumberInput from '../number-input';
// lib
import cloudinary from '../../../../lib/cloudinary';
import numberFormatter from '../../../../lib/formatters/number-formatter';
import * as utils from '../../../../lib/utils';
// cache
import shoppingCartCache from '../../../../cache/shopping-cart';

interface ComponentProps {
  store?: Store;
  product: Product;
  style?: StyleProp<ViewStyle>;
}

export default ({ store, product, style }: ComponentProps) => {
  // state
  const [qty, setQty] = useState<number | undefined>();
  const [expanded, setExpanded] = useState(false);

  // event handlers
  const changeQtyHandler = (qty: number) => {
    shoppingCartCache.set(store, product, qty);
  };

  const pressDescriptionHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setExpanded((prevExpanded) => !prevExpanded);
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
          cloudinary.dynamicUrl(image, 'h_500')
        )}
      />
      <Text level={6} weight="bold" style={{ marginBottom: 10 }}>
        {`${product.name} · `}
        <Text level={6} weight="normal">
          {numberFormatter.toCurrency(product.price)}
        </Text>
      </Text>

      <Touchable
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 5,
        }}
        onPress={pressDescriptionHandler}
      >
        <Text level={6} weight="normal">
          Descripción
        </Text>
        {expanded ? <Icon name="chevron-up" /> : <Icon name="chevron-down" />}
      </Touchable>
      {expanded && (
        <View style={{ marginHorizontal: 10, marginBottom: 15 }}>
          <Text level={7}>{product.description}</Text>
        </View>
      )}
      <View style={{ minHeight: 45 }}>
        {!!store && typeof qty !== 'undefined' && (
          <NumberInput
            value={qty}
            style={{ alignSelf: 'center' }}
            onChange={changeQtyHandler}
          />
        )}
      </View>
    </View>
  );
};
