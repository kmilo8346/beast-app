import React from 'react';
import { View } from 'react-native';

// components
import { Text, Button } from '../../components';
// styles
import globalStyles from '../../styles';
import colors from '../../styles/colors';

interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // event handlers
  const pressMainActionHandler = () => {
    navigation.navigate('SignIn', {
      redirect: {
        name: 'MainTab',
      },
    });
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
      <View style={{ alignItems: 'center', marginTop: '70%' }}>
        <Text level={5} style={{ lineHeight: 30 }}>
          Al continuar, estas aceptando los
        </Text>
        <Text
          level={5}
          color={colors.blue}
          weight="bold"
          style={{ textAlign: 'center' }}
        >
          Términos de servicio y políticas de privacidad.
        </Text>
      </View>
      <View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
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
