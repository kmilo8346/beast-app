import React from 'react';
import { View, ScrollView } from 'react-native';

// components
import { Container, Text, Button } from '../../../components';
// styles
import globalStyles from '../../../styles';

export interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // event handlers
  // const pressContinueHandler = () => {
  //   // navigation to Menu
  //   navigation.navigate('Menu');
  // };

  // render logic
  return (
    <Container>
      <ScrollView
        style={[{ flex: 1, paddingTop: 15 }, globalStyles.withPadding]}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text level={5} style={{ lineHeight: 30 }}>
            Historial de compras ...
          </Text>
        </View>
        <View style={globalStyles.withScreenAir} />
      </ScrollView>
      {/* <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <Button
          title="Guardar cambios"
          style={[globalStyle.withMargin, globalStyle.withMainActionAir]}
          onPress={pressContinueHandler}
        />
      </View> */}
    </Container>
  );
};
