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
          La app para comprar y vender en tu edificio.
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <View style={{ marginTop: 5 }}>
            <HamburguerIcon />
          </View>
          <View style={{ marginLeft: 20, flex: 1 }}>
            <Text level={5} weight="bold">
              Explora tu edificio y cercanías
            </Text>
            <Text level={5} style={{ lineHeight: 23 }}>
              Encuentra productos de tus vecinos y con la información
              actualizada.
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <View style={{ marginTop: 5 }}>
            <NoteIcon />
          </View>
          <View style={{ marginLeft: 20, flex: 1 }}>
            <Text level={5} weight="bold">
              Envia tu pedido por Whatsapp
            </Text>
            <Text level={5} style={{ lineHeight: 23 }}>
              Te ahorramos el trabajo de escribir tu pedido, para que no pierdas
              tiempo.
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <View style={{ marginTop: 5 }}>
            <BankIcon />
          </View>
          <View style={{ marginLeft: 20, flex: 1 }}>
            <Text level={5} weight="bold">
              Vende con facilidad
            </Text>
            <Text level={5} style={{ lineHeight: 23 }}>
              Crea tu tienda en menos de un minuto y recibe tus pedidos al
              Whatsapp.
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
