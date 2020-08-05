import React, { useCallback } from 'react';
import { View } from 'react-native';

// components
import { Container, Text, Button } from '../../components';
// styles
import globalStyles from '../../styles';

export interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // event handlers
  const pressOmitHandler = useCallback(() => {
    navigation.navigate('Terms', {
      redirect: {
        name: 'SetAddress',
      },
    });
  }, []);
  const pressStartToShopHandler = useCallback(async () => {
    navigation.navigate('Terms', {
      redirect: {
        name: 'SignIn',
      },
    });
  }, []);

  // render logic
  return (
    <Container safeArea withMargin>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }} />
        <Button
          title="Omitir"
          type="link"
          style={{ alignItems: 'flex-end' }}
          onPress={pressOmitHandler}
        />
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text level={5}>
          Aki mostramos lo que un comprador y un vendedor pueden lograr con
          Shop-Shop
        </Text>
      </View>
      <Button
        title="Empieza hacer tus compras"
        onPress={pressStartToShopHandler}
        style={globalStyles.withMainActionAir}
      />
    </Container>
  );
};
