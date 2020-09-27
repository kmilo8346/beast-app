import React from 'react';
import { View } from 'react-native';

// components
import Container from '../../../components/container';
import Text from '../../../components/text';
import Button from '../../../components/buttons/button';
// containers
import UserProvider from '../../../containers/user';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[seller onboarding screen]';

export interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }

  // event hanlders
  const pressCreateStoreHandler = () => {
    // navigation
    if (!user.email) {
      navigation.navigate('SignIn', {
        redirect: {
          name: 'SellerDashboard',
        },
      });
      return;
    }
    if (!user.phone || !user.phoneVerified) {
      navigation.navigate('SetPhone', {
        redirect: {
          name: 'SellerDashboard',
        },
      });
      return;
    }
    navigation.replace('SetStoreInfo');
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
          ¡Vende con nosotros!
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
