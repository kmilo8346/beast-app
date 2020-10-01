import React, { ReactNode, useState } from 'react';
import { View, ScrollView, GestureResponderEvent } from 'react-native';

// components
import Text from '../../../components/text';
import ButtonIcon from '../../../components/buttons/button-icon';
import Icon from '../../../components/icon';
import Divider from '../../../components/divider';
// local components
import Item from './components/item';
// libs
import * as utils from '../../../lib/utils';
import numberFormatter from '../../../lib/formatters/number-formatter';
import dateFormatter from '../../../lib/formatters/date-formatter';
// containers
import storeCache from '../../../cache/store';
// types
import { Order, DispatchProvider } from '../../../types';
// styles
import colors from '../../../styles/colors';
import globalStyles from '../../../styles';

// instaces outside component
const prefix = '[owner rrss sale details screen]';

export interface SaleDetailsProps {
  route: any;
}

export default ({ route }: SaleDetailsProps) => {
  // state
  const [collapsed, setCollapsed] = useState(true);
  const sale: Order = route.params.sale;
  if (!sale) {
    throw new Error(`${prefix} Sale must be defined`);
  }
  if (sale.dispatch_provider_id !== DispatchProvider.OWNER_RRSS) {
    throw new Error(
      `${prefix} Invalid dispatch provider, dispatch provider: ${sale.dispatch_provider_id}`
    );
  }
  const store = storeCache.getData();
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }

  // event handlers
  const pressCollapseHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setCollapsed(true);
  };

  const pressExpandHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setCollapsed(false);
  };

  // render logic
  const stats = utils.getStats(sale.transaction.shopping_cart);

  // products and collpase button
  let products = sale.transaction.shopping_cart;
  let collapseButton: ReactNode | null = (
    <ButtonIcon icon="chevron-up" onPress={pressCollapseHandler} />
  );
  if (collapsed) {
    products = products.slice(0, 3);
    collapseButton = (
      <ButtonIcon icon="chevron-down" onPress={pressExpandHandler} />
    );
  }
  if (sale.transaction.shopping_cart.length <= 3) {
    collapseButton = null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={[globalStyles.withMargin, { marginTop: 15 }]}>
          <Text
            level={4}
            weight="bold"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ flex: 1, color: colors.blackLight1 }}
          >
            Venta por redes sociales
          </Text>

          <View style={{ flexDirection: 'row', marginTop: 25 }}>
            <Icon name="user" color={colors.blue} size={30} />
            <View style={{ marginLeft: 20 }}>
              <Text
                level={6}
                color={colors.blackLight4}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ marginBottom: 10 }}
              >
                Nombre cliente
              </Text>
              <Text
                level={6}
                // weight="bold"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Usuario de red social
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', marginTop: 30 }}>
            <Icon name="calendar" color={colors.blue} size={30} />
            <View style={{ marginLeft: 20 }}>
              <Text
                level={6}
                color={colors.blackLight4}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ marginBottom: 10 }}
              >
                Fecha
              </Text>
              <Text
                level={6}
                // weight="bold"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {dateFormatter.format(
                  new Date(sale.created_at),
                  "dd MMMM, yyyy · HH:mm 'hrs'"
                )}
              </Text>
            </View>
          </View>
        </View>

        <Divider type="thick" style={{ marginTop: 40 }} />

        <View style={[{ marginTop: 30 }, globalStyles.withMargin]}>
          <Text
            level={4}
            weight="bold"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ flex: 1, color: colors.blackLight1 }}
          >
            Resumen de productos
          </Text>
          <View
            style={{
              height: 1,
              backgroundColor: colors.blackLight6,
              marginTop: 25,
              marginBottom: 15,
            }}
          />

          {products.map((product) => {
            return <Item key={product.id} product={product} />;
          })}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            {collapseButton}
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: colors.blackLight6,
              marginTop: 10,
              marginBottom: 20,
            }}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text level={5} weight="bold">
              Total
            </Text>
            <Text level={3} weight="bold">
              {numberFormatter.toCurrency(stats.ammount)}
            </Text>
          </View>
        </View>

        <View style={globalStyles.withScreenAir} />
      </ScrollView>
    </View>
  );
};
