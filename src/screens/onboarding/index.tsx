import React, { useCallback } from 'react';
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
      <Text level={5}>
        Aki mostramos lo que un comprador y un vendedor pueden lograr con
        Shop-Shop
      </Text>
      <View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
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
