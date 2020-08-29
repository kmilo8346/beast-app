import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';

// components
import Text from '../../components/text';
import Button from '../../components/buttons/button';
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
      redirect: {
        name: 'MainTab',
      },
    });
  };
  const pressTermHandler = () => {
    Linking.openURL('https://beast-production.web.app/policies/');
  };

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
      <View style={{ alignItems: 'center', marginTop: '30%' }}>
        <SignedDocumentBlue />
        <View style={{ height: 20 }} />
        <Text level={5} weight="200" style={{ lineHeight: 30 }}>
          Al continuar, estás aceptando los
        </Text>
        <Button
          title="Términos de servicio y políticas de privacidad."
          type="link"
          onPress={pressTermHandler}
        />
      </View>
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
