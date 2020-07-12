import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createStackNavigator,
  StackHeaderTitleProps,
  StackNavigationOptions,
} from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// screens
import {
  OnboardingScreen,
  TermsScreen,
  SignInScreen,
  SetPhoneScreen,
  VerifyPhoneScreen,
  SetAddressScreen,
  HomeScreen,
  PLPScreen,
  PLPInStoreScreen,
  PDPScreen,
  CheckoutScreen,
  SellerOnboardingScreen,
  SetStoreInfoScreen,
  SetStoreDeliveryInfoScreen,
  MercadoPagoSignInScreen,
  SellerDashboardScreen,
  MenuScreen,
} from './screens';
// components
import { Icon, Text, ButtonCart, Loading } from './components';
// containers
import UserProvider from './containers/user';
// libs
import { navigationRef } from './lib/root-navigation';
// styles
import colors from './styles/colors';

const cartStyle = { marginRight: 20, marginTop: 5 };
const commonStackOptions: StackNavigationOptions = {
  headerBackImage: () => <Icon name="chevron-left" />,
  headerLeftContainerStyle: {
    marginLeft: 18,
  },
  headerBackTitleVisible: false,
  headerTitle: ({ style, children }: StackHeaderTitleProps) => (
    <Text level={2} weight="bold" style={[{ marginTop: 5 }, style]}>
      {children}
    </Text>
  ),
  headerStyle: {
    shadowColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitleAlign: 'center',
};

const HomeStack = createStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={commonStackOptions}>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="PLP"
        component={PLPScreen}
        options={{
          title: 'Buscar',
          headerRight: () => <ButtonCart containerStyle={cartStyle} />,
        }}
      />
      <HomeStack.Screen
        name="PLPInStore"
        component={PLPInStoreScreen}
        options={{
          headerRight: () => <ButtonCart containerStyle={cartStyle} />,
        }}
      />
      <HomeStack.Screen
        name="PDP"
        component={PDPScreen}
        options={{
          title: '',
          headerRight: () => <ButtonCart containerStyle={cartStyle} />,
        }}
      />
      <HomeStack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ title: '' }}
      />
      <MainStack.Screen
        name="SetPhone"
        component={SetPhoneScreen}
        options={{ title: '' }}
      />
      <MainStack.Screen
        name="VerifyPhone"
        component={VerifyPhoneScreen}
        options={{ title: '' }}
      />
      <HomeStack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Mi Pedido' }}
      />
    </HomeStack.Navigator>
  );
}

const SearchStack = createStackNavigator();

function SearchStackScreen() {
  return (
    <SearchStack.Navigator screenOptions={commonStackOptions}>
      <HomeStack.Screen
        name="PLP"
        component={PLPScreen}
        options={{
          title: '',
          headerRight: () => <ButtonCart containerStyle={cartStyle} />,
        }}
      />
      <HomeStack.Screen
        name="PLPInStore"
        component={PLPInStoreScreen}
        options={{
          headerRight: () => <ButtonCart containerStyle={cartStyle} />,
        }}
      />
      <HomeStack.Screen
        name="PDP"
        component={PDPScreen}
        options={{
          title: '',
          headerRight: () => <ButtonCart containerStyle={cartStyle} />,
        }}
      />
      <HomeStack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ title: '' }}
      />
      <MainStack.Screen
        name="SetPhone"
        component={SetPhoneScreen}
        options={{ title: '' }}
      />
      <MainStack.Screen
        name="VerifyPhone"
        component={VerifyPhoneScreen}
        options={{ title: '' }}
      />
      <HomeStack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Mi Pedido' }}
      />
    </SearchStack.Navigator>
  );
}

const SellerStack = createStackNavigator();

function SellerStackScreen() {
  const userContainer = UserProvider.useContainer();
  const user = userContainer.getUser();
  const store = userContainer.getStore();

  let initialRoute = 'SellerDashboard';
  if (
    !store ||
    !user?.email ||
    !user?.customerId ||
    !user?.phone ||
    !user?.phoneVerified
  ) {
    initialRoute = 'SellerOnboarding';
  } else if (!store.name || !store.images) {
    initialRoute = 'SetStoreInfo';
  } else if (
    !store.deliveryArea ||
    !store.deliveryTime ||
    !store.openingHours
  ) {
    initialRoute = 'SetStoreDeliveryInfo';
  } else if (!store.sellerCredentials?.userId) {
    initialRoute = 'MercadoPagoSignIn';
  }

  return (
    <SellerStack.Navigator
      screenOptions={commonStackOptions}
      initialRouteName={initialRoute}
    >
      <SellerStack.Screen
        name="SellerOnboarding"
        component={SellerOnboardingScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ title: '' }}
      />
      <MainStack.Screen
        name="SetPhone"
        component={SetPhoneScreen}
        options={{ title: '' }}
      />
      <MainStack.Screen
        name="VerifyPhone"
        component={VerifyPhoneScreen}
        options={{ title: '' }}
      />
      <SellerStack.Screen
        name="SetStoreInfo"
        component={SetStoreInfoScreen}
        options={{ title: '' }}
      />
      <SellerStack.Screen
        name="SetStoreDeliveryInfo"
        component={SetStoreDeliveryInfoScreen}
        options={{ title: '' }}
      />
      <SellerStack.Screen
        name="MercadoPagoSignIn"
        component={MercadoPagoSignInScreen}
        options={{ title: '' }}
      />
      <SellerStack.Screen
        name="SellerDashboard"
        component={SellerDashboardScreen}
      />
    </SellerStack.Navigator>
  );
}

const MenuStack = createStackNavigator();

function MenuStackScreen() {
  return (
    <MenuStack.Navigator screenOptions={commonStackOptions}>
      <MenuStack.Screen
        name="Menu"
        component={MenuScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ title: '' }}
      />
      <MainStack.Screen
        name="SetPhone"
        component={SetPhoneScreen}
        options={{ title: '' }}
      />
      <MainStack.Screen
        name="VerifyPhone"
        component={VerifyPhoneScreen}
        options={{ title: '' }}
      />
    </MenuStack.Navigator>
  );
}

const MainTab = createBottomTabNavigator();

function MainTabScreen() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => {
        return {
          tabBarIcon: ({ color, size }) => {
            let name;
            switch (route.name) {
              case 'SearchStack':
                name = 'search';
                break;
              case 'SellerStack':
                name = 'tag';
                break;
              case 'MenuStack':
                name = 'menu';
                break;
              default:
                name = 'home';
                break;
            }
            return <Icon name={name} size={size} color={color} />;
          },
          tabBarLabel: () => {
            let text;
            switch (route.name) {
              case 'SearchStack':
                text = 'Buscar';
                break;
              case 'SellerStack':
                text = 'Vender';
                break;
              case 'MenuStack':
                text = 'Más';
                break;
              default:
                text = 'Inicio';
                break;
            }
            return <Text level={8}>{text}</Text>;
          },
        };
      }}
      tabBarOptions={{
        activeTintColor: colors.blue,
        inactiveTintColor: colors.black,
      }}
    >
      <MainTab.Screen name="HomeStack" component={HomeStackScreen} />
      <MainTab.Screen name="SearchStack" component={SearchStackScreen} />
      <MainTab.Screen name="SellerStack" component={SellerStackScreen} />
      <MainTab.Screen name="MenuStack" component={MenuStackScreen} />
    </MainTab.Navigator>
  );
}

const MainStack = createStackNavigator();

/**
 * Boot component control de navigation in boot time
 *
 * navigation
 *
 * MainStack
 *  TermsScreen
 *  OnboardingScreen
 *  *SignInScreen
 *  SetAddressScreen
 *  MainTab
 *    HomeStack
 *      ....
 *    SearchStack
 *      ...
 *    ToSaleStack
 *      ...
 *    MenuStack
 *      ...
 */
export default () => {
  // state
  const userContainer = UserProvider.useContainer();
  const user = userContainer.getUser();

  // render logic
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Loading />
      </View>
    );
  }

  // Valid in MainTab
  // user anonymous with current address
  // user logged with phone verified and current address
  let initialRoute = 'MainTab';
  if (!user.email && !user.currentAddress) {
    initialRoute = 'Onboarding';
  } else if (user.email && (!user.phone || !user.phoneVerified)) {
    initialRoute = 'SetPhone';
  } else if (user.email && !user.currentAddress) {
    initialRoute = 'SetAddress';
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <MainStack.Navigator
          screenOptions={commonStackOptions}
          initialRouteName={initialRoute}
        >
          <MainStack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
          <MainStack.Screen
            name="Terms"
            component={TermsScreen}
            options={{ title: '' }}
          />
          <MainStack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ title: '' }}
            initialParams={{
              redirect: {
                name: 'MainTab',
              },
            }}
          />
          <MainStack.Screen
            name="SetPhone"
            component={SetPhoneScreen}
            options={{ title: '' }}
            initialParams={{
              redirect: {
                name: 'MainTab',
              },
            }}
          />
          <MainStack.Screen
            name="VerifyPhone"
            component={VerifyPhoneScreen}
            options={{ title: '' }}
            initialParams={{
              redirect: {
                name: 'MainTab',
              },
            }}
          />
          <MainStack.Screen
            name="SetAddress"
            component={SetAddressScreen}
            options={{ title: '' }}
          />
          <MainStack.Screen
            name="MainTab"
            component={MainTabScreen}
            options={{ headerShown: false }}
          />
        </MainStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
