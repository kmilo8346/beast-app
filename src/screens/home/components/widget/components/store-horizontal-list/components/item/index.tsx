import React, { memo, useCallback, useEffect, useState } from 'react';
import { View, Image, Dimensions, GestureResponderEvent } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// components
import Text from '../../../../../../../../components/text';
import Touchable from '../../../../../../../../components/touchable';
// caches
import userCache from '../../../../../../../../cache/user';
// lib
import * as utils from '../../../../../../../../lib/utils';
import cloudinary from '../../../../../../../../lib/cloudinary';
import numberFormatter from '../../../../../../../../lib/formatters/number-formatter';
// types
import { Place, StoreProduct, User } from '../../../../../../../../types';
// styles
import colors from '../../../../../../../../styles/colors';

interface ComponentProps {
  navigation: any;
  data: StoreProduct & { inner_hits?: StoreProduct[]; distance?: number };
  last: boolean;
}

export default memo(({ navigation, data, last }: ComponentProps) => {
  // state
  const [distance, setDistance] = useState<number | undefined>();
  const [user, setUser] = useState(userCache.getData() as User);

  // event handlers
  const goToProductScreen = (product: StoreProduct) => {
    navigation.navigate('Product', {
      product: { ...product, store: data.store_info.id },
    });
  };

  const pressStoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('Store', { store: data.store_info });
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = userCache.onChange((user) => {
        setUser(user as User);
      });
      return () => {
        unsubscribe();
      };
    }, [])
  );

  useEffect(() => {
    if (distance) {
      setDistance(distance);
    } else if (data.store_info.address?.location) {
      const address = userCache.getAddress() as Place;
      setDistance(
        utils.distance(
          data.store_info.address.location.lat,
          data.store_info.address.location.lon,
          address.location.lat,
          address.location.lon,
          'K'
        )
      );
    }
  }, [user.current_address, data.store_info.address?.location, data.distance]);

  // render logic
  const size = (Dimensions.get('window').width * 0.97 - 20 * 2) / 2;
  return (
    <View style={{ marginLeft: 20, marginRight: last ? 20 : 0 }}>
      <Touchable
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
        onPress={pressStoreHandler}
      >
        <Image
          source={{
            uri: cloudinary.dynamicUrl(data.store_info.images[0], 'h_500'),
            width: 40,
            height: 40,
          }}
          style={{
            borderRadius: 100,
            resizeMode: 'cover',
            borderWidth: 1,
            borderColor: colors.blackLight8,
          }}
        />
        <Text
          level={6}
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ flex: 1, marginLeft: 7, letterSpacing: -0.5 }}
        >
          {data.store_info.name}
          {distance !== undefined && (
            <Text
              level={7}
              numberOfLines={1}
              ellipsizeMode="tail"
              color={colors.blackLight2}
            >
              {` · ${numberFormatter.humanizeDistance(distance)}`}
            </Text>
          )}
        </Text>
      </Touchable>

      <View style={{ flexDirection: 'row' }}>
        {(data.inner_hits || []).map((product, index, array) => (
          <Touchable
            key={product.id}
            onPress={(event: GestureResponderEvent) => {
              event.stopPropagation();
              goToProductScreen(product);
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: 5,
                zIndex: 9,
                bottom: 5,
                backgroundColor: colors.blackLight1,
                opacity: 0.8,
                paddingHorizontal: 5,
                paddingVertical: 3,
                borderRadius: 4,
              }}
            >
              <Text level={6} color={colors.white}>
                {numberFormatter.toCurrency(product.price)}
              </Text>
            </View>

            <Image
              source={{
                uri: cloudinary.dynamicUrl(product.images[0], 'h_500'),
                width: size,
                height: size,
              }}
              style={{
                borderRadius: 8,
                marginRight: index === array.length - 1 ? 0 : 3,
                borderWidth: 1,
                borderColor: colors.blackLight8,
              }}
            />
          </Touchable>
        ))}
      </View>
    </View>
  );
});
