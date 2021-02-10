import React from 'react';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureResponderEvent, ScrollView, View } from 'react-native';

// components
import Text from '../../components/text';
import Button from '../../components/buttons/button';
import BankIcon from '../../components/svgs/icons/bank';
import NoteIcon from '../../components/svgs/icons/note';
import HamburguerIcon from '../../components/svgs/icons/hamburguer';
// cache
import genericCache from '../../cache/generic';
// styles
import globalStyles from '../../styles';
import colors from '../../styles/colors';
import { capture } from '../../lib/sentry';

// instances outside component
const prefix = '[onboarding screen]';

interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // event handlers
  const goToHome = async () => {
    genericCache.updateData({ onboarding: true });
    navigation.replace('MainTab');
  };

  const continueHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    goToHome();
  };

  const pressTermsHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    try {
      WebBrowser.openBrowserAsync(
        `${Constants.manifest.extra.BEAST_WEB_URL}/policies`
      );
    } catch (error) {
      capture(prefix, 'Press terms handler error', error);
    }
  };

  // render logic
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[
          { flex: 1, backgroundColor: colors.white },
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
          Haz tus compras a tus vecinos y ahorra tiempo.
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

        <View style={globalStyles.withScreenAir} />
      </ScrollView>
      <View
        style={[
          {
            backgroundColor: colors.white,
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
          style={{ marginTop: 3, marginBottom: 15 }}
          onPress={pressTermsHandler}
        />
        <Button
          title="Continuar"
          style={globalStyles.withMainActionAir}
          onPress={continueHandler}
        />
      </View>
    </SafeAreaView>
  );
};
