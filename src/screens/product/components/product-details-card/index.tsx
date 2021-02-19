import React, { useEffect, useState } from 'react';
import {
  StyleProp,
  View,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import * as Linking from 'expo-linking';

// product components
import NumberInput from '../number-input';
// screen components
import Carousell from '../../../components/carousell';
// components
import Text from '../../../../components/text';
import Icon from '../../../../components/icon';
import Button from '../../../../components/buttons/button';
import ReadMore from '../../../../components/text/read-more';
// lib
import * as utils from '../../../../lib/utils';
import { capture } from '../../../../lib/sentry';
import cloudinary from '../../../../lib/cloudinary';
import numberFormatter from '../../../../lib/formatters/number-formatter';
// cache
import shoppingCartCache from '../../../../cache/shopping-cart';
// types
import { Product, Store } from '../../../../types';
// styles
import globalStyles from '../../../../styles';
import colors from '../../../../styles/colors';

const prefix = '[product details components]';

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
          cloudinary.dynamicUrl(image, 'h_500')
        )}
      />
      {!!store && (
        <View style={{ marginTop: 10, marginBottom: 10 }}>
          {typeof qty !== 'undefined' && !!product.reference && (
            <View style={{ minHeight: 45, marginTop: 10, marginBottom: 10 }}>
              <NumberInput
                value={qty}
                style={{ alignSelf: 'center' }}
                onChange={changeQtyHandler}
              />
            </View>
          )}

          <View style={globalStyles.withMargin}>
            {!!product.name && !!product.price && (
              <Text level={3} weight="bold" style={{ marginBottom: 5 }}>
                {product.name}
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

            {!!store?.phone && (
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 25,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                  }}
                >
                  <Icon name="whatsapp" size={30} color="#55A931" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text
                      level={6}
                      weight="bold"
                      color={colors.blackLight1}
                      style={{
                        letterSpacing: -0.5,
                        marginBottom: 2,
                      }}
                    >
                      Envía mensaje al vendedor
                    </Text>
                    <Text level={6} weight="normal">
                      ¡Hola, me interesa!
                    </Text>
                  </View>
                </View>
                <Button
                  title={
                    <Text level={6} weight="bold" color={colors.white}>
                      Enviar
                    </Text>
                  }
                  style={{
                    paddingHorizontal: 17,
                    paddingVertical: 0,
                  }}
                  onPress={async (event: GestureResponderEvent) => {
                    event.stopPropagation();
                    try {
                      await Linking.openURL(
                        `whatsapp://send?text=${`¡Hola, me interesa!🤩\n\n✅${
                          product.name
                        } · ${numberFormatter.toCurrency(
                          product.price
                        )}`}&phone=${store.phone}`
                      );
                    } catch (error) {
                      capture(prefix, 'Press send to chat error', error);
                    }
                  }}
                />
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};
