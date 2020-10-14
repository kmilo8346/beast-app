import React, { useCallback, useState } from 'react';
import {
  GestureResponderEvent,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// components
import Touchable from '../../../components/touchable';
import Icon from '../../../components/icon';
import Badge from '../../../components/badge';
// cache
import shoppingCartCache, { getTotal } from '../../../cache/shopping-cart';
// lib
import { navigate } from '../../../lib/root-navigation';

interface ComponentProps {
  style?: StyleProp<ViewStyle>;
}

export default ({ style }: ComponentProps) => {
  // state
  const [total, setTotal] = useState<number | undefined>();

  // event handlers
  const pressHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigate('ShoppingCartStack');
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = shoppingCartCache.onChange((data) => {
        setTotal(getTotal(data));
      });
      return () => {
        unsubscribe();
      };
    }, [])
  );

  // render logic
  if (typeof total === 'undefined' || total <= 0) {
    return null;
  }

  return (
    <Touchable
      onPress={pressHandler}
      style={[
        {
          paddingVertical: 5,
          paddingLeft: 15,
          paddingRight: 5,
          position: 'relative',
        },
        style,
      ]}
    >
      <View
        style={{
          zIndex: 9,
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
      >
        <Badge
          count={total}
          style={{ position: 'absolute', top: -7, left: 1 }}
        />
      </View>
      <Icon name="shopping-cart" size={20} />
    </Touchable>
  );
};
