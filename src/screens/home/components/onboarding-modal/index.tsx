import React from 'react';
import { Modal, GestureResponderEvent, View, ScrollView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import Text from '../../../../components/text';
import Button from '../../../../components/buttons/button';
import HamburguerIcon from '../../../../components/svgs/icons/hamburguer';
import NoteIcon from '../../../../components/svgs/icons/note';
import BankIcon from '../../../../components/svgs/icons/bank';
// lib
import * as utils from '../../../../lib/utils';
// styles
import globalStyles from '../../../../styles';
import colors from '../../../../styles/colors';

interface ComponentProps {
  onClose?: () => void;
}

export default ({ onClose = utils.noop }: ComponentProps) => {
  // event handlers
  const dismissHandler = () => {
    onClose();
  };

  const requestCloseHandler = () => {
    onClose();
  };

  const continueHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onClose();
  };

  const pressTermsHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    WebBrowser.openBrowserAsync(
      `${Constants.manifest.extra.BEAST_WEB_URL}/policies`
    );
  };

  // render logic
  const insets = useSafeAreaInsets();
  return (
    <Modal
      statusBarTranslucent
      animationType="slide"
      onDismiss={dismissHandler}
      onRequestClose={requestCloseHandler}
    >
      <ScrollView
        style={[
          { flex: 1, backgroundColor: colors.white, paddingTop: insets.top },
          globalStyles.withPadding,
        ]}
      >
        <View
          style={{
            height: 30,
            width: '100%',
          }}
        />
        <Text level={2} weight="bold" style={{ letterSpacing: 0.6 }}>
          Bienvenido a
        </Text>
        <Text
          level={2}
          weight="bold"
          color={colors.blue}
          style={{ marginBottom: 15, letterSpacing: 0.5 }}
        >
          Shop Shop
        </Text>
        <Text level={5} style={{ lineHeight: 23, marginBottom: 40 }}>
          Haz tus compras a tus vecinos emprendedores y ahorra tiempo.
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <View style={{ marginTop: 5 }}>
            <HamburguerIcon />
          </View>
          <View style={{ marginLeft: 20, flex: 1 }}>
            <Text level={5} weight="bold">
              Agrega productos a tu carrito
            </Text>
            <Text level={5} style={{ lineHeight: 23 }}>
              Encuentra productos recomendados o busca en tus tiendas favoritas.
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <View style={{ marginTop: 5 }}>
            <NoteIcon />
          </View>
          <View style={{ marginLeft: 20, flex: 1 }}>
            <Text level={5} weight="bold">
              Pide primero y paga después
            </Text>
            <Text level={5} style={{ lineHeight: 23 }}>
              Haz tu pedido desde la app y la tienda te contactará para acordar
              el pago y despacho.
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <View style={{ marginTop: 5 }}>
            <BankIcon />
          </View>
          <View style={{ marginLeft: 20, flex: 1 }}>
            <Text level={5} weight="bold">
              Vende sin comisiones
            </Text>
            <Text level={5} style={{ lineHeight: 23 }}>
              Crea tu tienda, con tu horario de atención y área de despacho en
              menos de un minuto.
            </Text>
          </View>
        </View>
      </ScrollView>
      <View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingBottom: insets.bottom,
          },
          globalStyles.withMargin,
        ]}
      >
        <Button
          title={
            <Text level={7} color={colors.blue}>
              Términos y condiciones
            </Text>
          }
          type="link"
          style={{ marginBottom: 15 }}
          onPress={pressTermsHandler}
        />
        <Button
          title="Continuar"
          style={globalStyles.withMainActionAir}
          onPress={continueHandler}
        />
      </View>
    </Modal>
  );
};
