import React, { memo } from 'react';
import { View, Image, Dimensions, GestureResponderEvent } from 'react-native';

// components
import Text from '../../../../../../../../components/text';
import Icon from '../../../../../../../../components/icon';
import Touchable from '../../../../../../../../components/touchable';
// lib
import cloudinary from '../../../../../../../../lib/cloudinary';
import numberFormatter from '../../../../../../../../lib/formatters/number-formatter';
// types
import { StoreProduct } from '../../../../../../../../types';
// styles
import colors from '../../../../../../../../styles/colors';

interface ComponentProps {
  navigation: any;
  data: StoreProduct & { inner_hits?: StoreProduct[]; distance?: number };
  last: boolean;
}

export default memo(({ navigation, data, last }: ComponentProps) => {
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
        <View style={{ flex: 1, marginLeft: 7 }}>
          <Text
            level={6}
            weight="bold"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ letterSpacing: -0.5 }}
          >
            {data.store_info.name}
          </Text>

          {'distance' in data && (
            <Text
              level={7}
              numberOfLines={1}
              ellipsizeMode="tail"
              color={colors.blackLight2}
            >
              {numberFormatter.humanizeDistance(data.distance as number)}
            </Text>
          )}
        </View>

        <Icon name="chevron-right" size={20} color={colors.blackLight4} />
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
