import React from 'react';
import { View } from 'react-native';

// components
import { Container, Text, Button } from '../../../components';
// containers
import UserProvider from '../../../containers/user';
// libs
import { generatePushID } from '../../../lib/uuid';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

export interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const userContainer = UserProvider.useContainer();
  const user = userContainer.getUser();
  const store = userContainer.getStore();

  // event hanlders
  const pressCreateStoreHandler = () => {
    // create store if not exist
    if (!store) {
      userContainer.updateUser({
        store: {
          id: generatePushID(),
        },
      });
    }
    // navigation
    if (!user?.email || !user?.customerId) {
      navigation.navigate('SignIn', {
        redirect: {
          name: 'SellerDashboard',
        },
      });
      return;
    }
    if (!user?.phone || !user?.phoneVerified) {
      navigation.navigate('SetPhone', {
        redirect: 'SellerDashboard',
      });
      return;
    }
    navigation.navigate('SetStoreInfo');
  };
  // render logic
  return (
    <Container
      withPadding
      style={{
        backgroundColor: colors.blue,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View style={{}}>
        <Text
          level={1}
          weight="bold"
          style={{ color: colors.white, marginBottom: 25 }}
        >
          !Vende con nosotros¡
        </Text>
        <Text level={4} style={{ color: colors.white }}>
          Aquí podrás crear una tienda para ofrecer tus productos y servicios.
        </Text>
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <Button
          type="secondary"
          title="Crear tienda"
          onPress={pressCreateStoreHandler}
          style={[globalStyles.withMainActionAir, globalStyles.withMargin]}
        />
      </View>
    </Container>
  );
};
