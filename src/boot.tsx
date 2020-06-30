import React from 'react';
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
  ToSaleScreen,
  MenuScreen,
  SignInFlow,
} from './screens';
// components
import { Icon, Text, ButtonCart } from './components';
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
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Mi Pedido' }}
      />
      <HomeStack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ title: '' }}
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
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Mi Pedido' }}
      />
      <HomeStack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ title: '' }}
      />
    </SearchStack.Navigator>
  );
}

const ToSaleStack = createStackNavigator();

function ToSaleStackScreen() {
  return (
    <ToSaleStack.Navigator screenOptions={commonStackOptions}>
      <ToSaleStack.Screen
        name="ToSale"
        component={ToSaleScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ title: '' }}
      />
    </ToSaleStack.Navigator>
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
              case 'ToSaleStack':
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
              case 'ToSaleStack':
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
      <MainTab.Screen name="ToSaleStack" component={ToSaleStackScreen} />
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
    return null;
  }

  let initialRoute = 'MainTab';
  if (!user?.currentAddress) {
    initialRoute = 'Onboarding';
  }
  // terms accepted
  // anonimous sin address
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
          <MainStack.Screen
            name="SignInFlow"
            component={SignInFlow}
            options={{ headerShown: false }}
          />
        </MainStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
