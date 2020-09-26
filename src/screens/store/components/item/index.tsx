import React, { ReactNode, useState, useEffect } from 'react';
import { View, Image, GestureResponderEvent } from 'react-native';

// components
import Touchable from '../../../../components/touchable';
import Badge from '../../../../components/badge';
import Text from '../../../../components/text';
// store components
import ProductDetailsModal from '../product-details-modal';
// local components
import NumberInput from './components/number-input';
// libs
import numberFormatter from '../../../../lib/formatters/number-formatter';
import cloudinary from '../../../../lib/cloudinary';
// cache
import shoppingCartsCache from '../../../../cache/shopping-carts';
// types
import { Product, Item } from '../../../../types';
import ShoppingCartCache from '../../../../cache/shopping-cart';

interface ComponentProps {
  data: Product;
}

export default ({ data }: ComponentProps) => {
  // state
  const [shoppingCartCache, setShoppingCartCache] = useState<
    ShoppingCartCache | undefined
  >();
  const [qty, setQty] = useState<number | undefined>();
  const [modal, setModal] = useState(false);

  // event handlers
  const instanceCache = async () => {
    const cache = await shoppingCartsCache.get(data.store);
    setShoppingCartCache(cache);
  };

  const changeHandler = (qty: number) => {
    shoppingCartCache?.set(data, qty);
  };

  const closeModalHandler = () => {
    setModal(false);
  };

  const pressItemHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setModal(true);
  };

  useEffect(() => {
    instanceCache();
  }, []);

  useEffect(() => {
    let unsubscriber: any = () => null;
    if (shoppingCartCache) {
      unsubscriber = shoppingCartCache.onChangeItem(
        data.id,
        (item: Item | undefined) => {
          if (item) {
            setQty(item.qty);
          } else {
            setQty(0);
          }
        }
      );
    }
    return () => {
      unsubscriber();
    };
  }, [shoppingCartCache]);

  // render logic
  const image = data.images[0];
  let badge: ReactNode | null = null;
  if (qty && qty > 0) {
    badge = (
      <View style={{ position: 'absolute', top: -6, left: -6 }}>
        <Badge count={qty} />
      </View>
    );
  }
  let numberInput: ReactNode | null = null;
  if (typeof qty !== 'undefined') {
    numberInput = <NumberInput value={qty} onChange={changeHandler} />;
  }
  return (
    <View style={{ flexDirection: 'row', paddingLeft: 5 }}>
      <Touchable
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        onPress={pressItemHandler}
      >
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: cloudinary.dynamicUrl(image, 'w_100') }}
            style={{ width: 50, height: 50, borderRadius: 10 }}
          />
          {badge}
        </View>

        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text level={6} weight="bold" numberOfLines={1} ellipsizeMode="tail">
            {data.name}
          </Text>
          <Text
            level={7}
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ marginBottom: 2 }}
          >
            {data.description}
          </Text>
          <Text level={6} weight="bold">
            {numberFormatter.toCurrency(data.price)}
          </Text>
        </View>
      </Touchable>
      <View
        style={{
          justifyContent: 'flex-end',
          paddingLeft: 15,
        }}
      >
        {numberInput}
      </View>

      {modal && (
        <ProductDetailsModal product={data} onClose={closeModalHandler} />
      )}
    </View>
  );
};
