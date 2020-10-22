import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

// components
import Text from '../../../../components/text';
// shopping cart components
import NumberInput from '../number-input';
// libs
import * as utils from '../../../../lib/utils';
import numberFormatter from '../../../../lib/formatters/number-formatter';
// types
import { Item, Product } from '../../../../types';
// styles
import colors from '../../../../styles/colors';

interface ComponentProps {
  data: Item;
  editing: boolean;
  style?: StyleProp<ViewStyle>;
  onChange?: (product: Product, qty: number) => void;
}

export default ({
  data,
  editing,
  style,
  onChange = utils.noop,
}: ComponentProps) => {
  // event handlers
  const changeQtyHandler = (qty: number) => {
    onChange(data, qty);
  };

  // render logic
  let rightComponent: ReactNode = (
    <Text
      level={6}
      weight="bold"
      style={{ alignSelf: 'center', marginLeft: 15 }}
    >
      {numberFormatter.toCurrency(data.price)}
    </Text>
  );
  if (editing) {
    rightComponent = (
      <NumberInput
        value={data.qty}
        onChange={changeQtyHandler}
        style={{ maxHeight: 30, alignSelf: 'flex-end' }}
      />
    );
  }
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <View
        style={{
          borderWidth: 2,
          borderColor: colors.blackLight9,
          borderRadius: 4,
          justifyContent: 'center',
          alignItems: 'center',
          minWidth: 30,
          minHeight: 38,
        }}
      >
        <Text level={6} weight="bold">
          {data.qty}
        </Text>
      </View>

      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text
          level={6}
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginBottom: 2 }}
        >
          {data.name}
        </Text>
        <Text level={7} numberOfLines={1} ellipsizeMode="tail">
          {data.description}
        </Text>
      </View>

      {rightComponent}
    </View>
  );
};
