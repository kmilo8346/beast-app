import React, { useRef } from 'react';
import { View, Share, Clipboard } from 'react-native';
import Constants from 'expo-constants';

// components
import Text from '../../../components/text';
import Toast, { IToast } from '../../../components/toast';
import Button from '../../../components/buttons/button';
import Divider from '../../../components/divider';
import Icon from '../../../components/icon';
import Touchable from '../../../components/touchable';
import CheckGreenIcon from '../../../components/svgs/icons/check-green';
// libs
import numberFormatter from '../../../lib/formatters/number-formatter';
import { capture } from '../../../lib/sentry';
// cache
import storeCache from '../../../cache/store';
// styles
import colors from '../../../styles/colors';
import globalStyles from '../../../styles';

// instances outside component
const prefix = '[rrss link created screen]';

export interface MySalesProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: MySalesProps) => {
  const { ammount, concept, link } = route.params;
  if (!ammount || !concept || !link) {
    throw new Error(
      `${prefix} Route params requires, ammount: ${ammount}, concept: ${concept}, link: ${link}`
    );
  }
  const toastRef = useRef<IToast>(null);
  const store = storeCache.getData();
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }

  // event handlers
  const pressContinueHandler = () => {
    // TODO: reset
    navigation.navigate('SellerDashboard');
  };

  const pressCopyHandler = async () => {
    try {
      await Clipboard.setString(`Mensaje creado por Shop Shop ${
        Constants.manifest.extra.BEAST_WEB_URL
      }

${store.name} quiere cobrarte ${numberFormatter.toCurrency(
        ammount
      )} por ${concept}. 
Pagar aqui: ${link}`);
    } catch (error) {
      capture(prefix, 'Press copy handler error', error);
    }
  };

  const pressShareHandler = async () => {
    try {
      await Share.share({
        message: `Mensaje creado por Shop Shop ${
          Constants.manifest.extra.BEAST_WEB_URL
        }

${store.name} quiere cobrarte ${numberFormatter.toCurrency(
          ammount
        )} por ${concept} 
Pagar aqui: ${link}`,
      });
    } catch (error) {
      capture(prefix, 'Press share handler error', error);
    }
  };

  // render logic
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={{ alignItems: 'center', paddingTop: 30, marginBottom: 35 }}>
        <Text level={4} style={{ marginBottom: 10, color: colors.blackLight2 }}>
          Total a cobrar:
        </Text>
        <Text level={3} weight="bold">
          {numberFormatter.toCurrency(ammount)}
        </Text>
      </View>

      <Divider type="thick" />

      <View style={{ alignItems: 'center', paddingTop: 40 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <Text
            level={4}
            style={{ marginRight: 10, color: colors.blackLight2 }}
          >
            Link creado
          </Text>
          <CheckGreenIcon />
        </View>

        <View style={{ flexDirection: 'row' }}>
          <View style={{ alignItems: 'center' }}>
            <Touchable onPress={pressCopyHandler}>
              <View
                style={{
                  backgroundColor: colors.blackLight8,
                  borderRadius: 50,
                  width: 70,
                  height: 70,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Icon name="copy" color={colors.blue} />
              </View>
            </Touchable>
            <Text level={6} color={colors.blackLight2}>
              Copiar
            </Text>
          </View>
          <View style={{ width: 50 }} />
          <View style={{ alignItems: 'center' }}>
            <Touchable onPress={pressShareHandler}>
              <View
                style={{
                  backgroundColor: colors.blackLight8,
                  borderRadius: 50,
                  width: 70,
                  height: 70,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Icon name="share" color={colors.blue} />
              </View>
            </Touchable>
            <Text level={6} color={colors.blackLight2}>
              Compartir
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.white,
          },
          globalStyles.withMargin,
        ]}
      >
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Continuar"
          style={globalStyles.withMainActionAir}
          onPress={pressContinueHandler}
        />
      </View>
    </View>
  );
};
