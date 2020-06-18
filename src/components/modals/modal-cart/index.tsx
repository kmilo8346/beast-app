import React, { ReactElement } from 'react';
import { SectionList, View, ViewStyle } from 'react-native';

// components
import Modal from '../modal';
import Text from '../../text';
import Button from '../../buttons/button';
import ProductItem from '../../product-item';
import InputSelectAddress from '../../inputs/input-select-address';
// containers
import Cart from '../../../containers/cart';
// libs
import numberFormatter from '../../../lib/formatters/number-formatter';
import { navigate } from '../../../lib/root-navigation';
// types
import { Store } from '../../../types';
// styles
import globalStyle from '../../../styles';
import colors from '../../../styles/colors';

const renderHeader = (): ReactElement => (
  <View style={{ marginBottom: 15 }}>
    <InputSelectAddress />
  </View>
);

const renderSectionHeader = (store: Store) => (
  <View
    style={{
      flexDirection: 'row',
      paddingBottom: 5,
      marginBottom: 0,
      backgroundColor: colors.white,
    }}
  >
    <View
      style={{
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 50,
          backgroundColor: 'lightgray',
        }}
      />
    </View>
    <View style={{ paddingHorizontal: 11 }}>
      <Text level={6} weight="bold" style={{ marginBottom: 5 }}>
        {store.name}
      </Text>
      <Text level={7} color={colors.blackLight2}>
        Entrega en 20 o 30 minutos
      </Text>
    </View>
  </View>
);

const renderFooter = (ammount: number): ReactElement => (
  <View style={[globalStyle.withCartSpace]}>
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
      }}
    >
      <Text level={6}>Subtotal</Text>
      <Text level={6}>{numberFormatter.toCurrency(ammount)}</Text>
    </View>
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}
    >
      <Text level={6}>Costo de envío</Text>
      <Text level={6}>Sin costo</Text>
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text level={6} weight="bold">
        Total
      </Text>
      <Text level={6} weight="bold">
        {numberFormatter.toCurrency(ammount)}
      </Text>
    </View>
  </View>
);

export interface CartModalProps {
  onRequestClose?: () => void;
}

export default ({ onRequestClose = () => null }: CartModalProps) => {
  const cartContainer = Cart.useContainer();
  const cart = cartContainer.getCart();
  const stats = cartContainer.getStats();

  const Header = renderHeader();
  const Footer = renderFooter(stats.ammount);
  return (
    <Modal title="Carrito" type="full" onRequestClose={onRequestClose}>
      <SectionList
        style={[globalStyle.withPadding]}
        sections={cart}
        ListHeaderComponent={Header}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { store } }) => {
          return renderSectionHeader(store);
        }}
        keyExtractor={(item, index) => `${index}-${item.id}`}
        renderItem={({ item, index, section }) => {
          let style: ViewStyle = {};
          if (index === section.data.length - 1) {
            style = { marginBottom: 15 };
          }
          return <ProductItem data={item} style={style} />;
        }}
        ListFooterComponent={Footer}
      />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <Button
          title="Hacer Pedido"
          style={[globalStyle.withMargin, globalStyle.withMainActionAir]}
          onPress={() => {
            onRequestClose();
            navigate('Checkout');
          }}
        />
      </View>
    </Modal>
  );
};
