import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import Text from '../../components/text';
import Button from '../../components/buttons/button';
import UsersWithLogo from '../../components/svgs/images/users-with-logo';
// styles
import globalStyles from '../../styles';
import colors from '../../styles/colors';

interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  const insets = useSafeAreaInsets();
  // event handlers
  const pressMainActionHandler = useCallback(async () => {
    navigation.navigate('Terms', {
      redirect: {
        name: 'SignIn',
      },
    });
  }, []);

  // render logic
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: colors.white,
          justifyContent: 'center',
          alignItems: 'center',
        },
        globalStyles.withPadding,
      ]}
    >
      <UsersWithLogo />
      <Text
        level={5}
        weight="light"
        style={{ marginTop: 30, lineHeight: 23, textAlign: 'center' }}
      >
        Comprar y vender nunca fue tan sencillo. Descubre lo que venden tus
        vecinos y más.
      </Text>
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
          title="Empieza hacer tus compras"
          onPress={pressMainActionHandler}
          style={globalStyles.withMainActionAir}
        />
      </View>
    </View>
  );
};
