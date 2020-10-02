import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

// components
import Text from '../../components/text';
import Button from '../../components/buttons/button';
import Icon from '../../components/icon';
import SignedDocumentBlue from '../../components/svgs/images/signed-document-blue';
// styles
import globalStyles from '../../styles';
import colors from '../../styles/colors';

interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  const insets = useSafeAreaInsets();
  // event handlers
  const pressMainActionHandler = () => {
    navigation.navigate('SignIn', {
      skip_set_phone_redirect: true,
      redirect: {
        name: 'MainTab',
      },
    });
  };
  const pressTermHandler = () => {
    Linking.openURL(`${Constants.manifest.extra.BEAST_WEB_URL}/policies`);
  };
  const ButtonGoToTermsTitle = (
    <>
      <Text
        level={5}
        weight="bold"
        color={colors.blue}
        style={{ lineHeight: 30, textAlign: 'center' }}
      >
        Términos de servicio y políticas de privacidad.{' '}
        <Icon name="external-link" size={20} />
      </Text>
    </>
  );
  // render logic
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: colors.white,
        },
        globalStyles.withPadding,
      ]}
    >
      <View style={{ flex: 1 }} />
      <View style={{ alignItems: 'center' }}>
        <SignedDocumentBlue />
        <View style={{ height: 20 }} />
        <Text level={5} weight="light" style={{ lineHeight: 30 }}>
          Al continuar, estás aceptando los
        </Text>
        <Button
          title={ButtonGoToTermsTitle}
          type="link"
          onPress={pressTermHandler}
        />
      </View>
      <View style={{ flex: 1 }} />
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
          title="Aceptar y continuar"
          onPress={pressMainActionHandler}
          style={globalStyles.withMainActionAir}
        />
      </View>
    </View>
  );
};
