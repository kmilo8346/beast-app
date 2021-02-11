import React, {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { View, Dimensions, GestureResponderEvent } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// components
import Text from '../../../../components/text';
import Image from '../../../../components/image';
import Touchable from '../../../../components/touchable';
// cache
import userCache from '../../../../cache/user';
// lib
import {
  CurrentOpenginHours,
  extractCurrentOpeningHours,
  humanizeCurrentClosedOpeningHours,
  distance as calculateDistance,
} from '../../../../lib/utils';
import cloudinary from '../../../../lib/cloudinary';
import numberFormatter from '../../../../lib/formatters/number-formatter';
// types
import { StoreProduct } from '../../../../types';
// styles
import globalStyles from '../../../../styles';
import colors from '../../../../styles/colors';

interface ComponentProps {
  navigation: any;
  data: StoreProduct & { inner_hits?: StoreProduct[]; distance?: number };
}

export default memo(({ navigation, data }: ComponentProps) => {
  // state
  const [size] = useState((Dimensions.get('window').width / 2 - 20) * 0.98);
  const [user, setUser] = useState(userCache.getData());
  const [distance, setDistance] = useState<number | undefined>();
  const [current_opening_hours, setCurrentOpeningHours] = useState<
    CurrentOpenginHours | undefined
  >();

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
        setUser(user);
      });
      return () => {
        unsubscribe();
      };
    }, [])
  );

  useEffect(() => {
    if (user?.current_address && data.store_info.address?.location) {
      const address = userCache.getAddress();
      if (address) {
        setDistance(
          calculateDistance(
            data.store_info.address.location.lat,
            data.store_info.address.location.lon,
            address.location.lat,
            address.location.lon,
            'K'
          )
        );
      }
    }
  }, [user?.current_address, data.store_info.address?.location]);

  useEffect(() => {
    if (data.store_info.opening_hours) {
      setCurrentOpeningHours(
        extractCurrentOpeningHours(data.store_info.opening_hours)
      );
    }
  }, [data.store_info.opening_hours]);

  // render logic
  let info: ReactNode = null;
  if (current_opening_hours?.status === 'closed') {
    info = (
      <View
        style={{
          backgroundColor: !current_opening_hours.next_open
            ? colors.black
            : colors.red2,
          alignSelf: 'flex-start',
          borderRadius: 10,
          paddingVertical: 3,
          paddingHorizontal: 10,
          marginTop: 4,
        }}
      >
        <Text
          level={7}
          numberOfLines={1}
          ellipsizeMode="tail"
          weight="bold"
          color={colors.white}
        >
          {humanizeCurrentClosedOpeningHours(current_opening_hours)}
        </Text>
      </View>
    );
  }
  return (
    <View style={{ marginBottom: 30 }}>
      <Touchable
        style={[
          { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
          globalStyles.withPadding,
        ]}
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
          }}
        />
        <View
          style={{
            flex: 1,
            marginLeft: 7,
            justifyContent: 'center',
          }}
        >
          <Text
            level={6}
            weight="bold"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ letterSpacing: -0.5 }}
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
          {info}
        </View>
      </Touchable>

      <View
        style={[
          { flexDirection: 'row', justifyContent: 'space-between' },
          globalStyles.withMargin,
        ]}
      >
        {(data.inner_hits || []).map((product) => (
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
