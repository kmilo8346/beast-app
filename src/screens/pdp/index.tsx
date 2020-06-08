import React, { useReducer } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { View, Image } from 'react-native';

import { ScreenView, Text, InputNumber, Button } from '../../components';
import numberFormatter from '../../lib/formatters/number-formatter';
import globalStyle from '../../styles';
import colors from '../../styles/colors';
import { Item, ProductItem, ServiceItem } from '../../types';

type ChangeQtyAction = { type: 'change_qty'; qty: number };
type Action = ChangeQtyAction;
type State = { item: Item };
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_qty':
      return { item: { ...state.item, qty: action.qty } as Item };
    default:
      throw new Error(`Action ${action.type} is not valid`);
  }
};

export interface PDPScreenProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  route: any;
}

export default ({ route }: PDPScreenProps) => {
  const [state, dispatch] = useReducer(reducer, { item: route.params });

  const changeQtyHandler = (value: number) => {
    dispatch({ type: 'change_qty', qty: value });
  };

  let format = null;
  let priceSection = null;
  let mainAction = null;
  if (state.item.type === 'product') {
    const product = state.item as ProductItem;
    format = (
      <Text
        level={2}
        color={colors.blackLight1}
        style={{ marginLeft: 3, marginTop: 10 }}
      >{`${product.format} · ${numberFormatter.toCurrency(
        product.price
      )}`}</Text>
    );
    mainAction = (
      <Button
        title="Agregar"
        onPress={() => {
          changeQtyHandler(1);
        }}
      />
    );
    if (product.qty) {
      priceSection = (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 25,
          }}
        >
          <InputNumber
            showValue
            type="dark"
            value={product.qty}
            onChange={changeQtyHandler}
          />
          <Text level={2}>
            {numberFormatter.toCurrency(product.qty * product.price)}
          </Text>
        </View>
      );
      mainAction = (
        <Button
          title={
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <Text level={4} weight="bold" color={colors.white}>
                (2){' '}
              </Text>
              <Text level={4} weight="bold" color={colors.white}>
                Carrito
              </Text>
              <View style={{ flex: 1 }} />
              <Text level={4} weight="bold" color={colors.white}>
                {numberFormatter.toCurrency(21000)}
              </Text>
            </View>
          }
        />
      );
    }
  } else {
    const service = state.item as ServiceItem;
    priceSection = (
      <Text style={{ marginTop: 15 }} level={2}>
        {service.price
          ? numberFormatter.toCurrency(service.price)
          : 'Precio a convenir'}
      </Text>
    );
    mainAction = <Button title="Contactar" />;
  }

  return (
    <ScreenView style={{ position: 'relative' }}>
      <ScrollView style={[globalStyle.withPadding]}>
        <View
          style={{
            alignSelf: 'center',
            width: 240,
            height: 216,
            borderRadius: 7,
          }}
        >
          <Image
            source={state.item.images[0]}
            style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
          />
        </View>
        <Text weight="bold" style={{ marginTop: 17 }}>
          {state.item.name}
        </Text>
        {format}
        {priceSection}
        <Text level={6} weight="bold" style={{ marginTop: 20 }}>
          Descripción
        </Text>
        <Text level={6} style={{ marginTop: 5 }}>
          Deliciosa torta de guayaba horneada con amor por los dioses
        </Text>
        <View style={globalStyle.withScreenAir} />
      </ScrollView>
      <View
        style={[
          { position: 'absolute', bottom: 0, left: 0, right: 0 },
          globalStyle.withPadding,
          globalStyle.withMainActionAir,
        ]}
      >
        {mainAction}
      </View>
    </ScreenView>
  );
};
