import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createStackNavigator,
  StackHeaderTitleProps,
  StackNavigationOptions,
} from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

// screens
import {
  BootScreen,
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
  SellerBootScreen,
  SelectOrCreateStoreScreen,
  SetStoreInfoScreen,
  UpdateStoreInfoScreen,
  SetStoreDeliveryInfoScreen,
  MercadoPagoSignInScreen,
  SellerDashboardScreen,
  CreateOrUpdateProductScreen,
  CreateOrUpdateServiceScreen,
  MyProductsScreen,
  MySalesScreen,
  SaleDetailsScreen,
  StockVerificationScreen,
  MenuScreen,
  UpdateAccountScreen,
  OrdersScreen,
  HelpScreen,
} from './screens';
// components
import { Icon, Text, ButtonCart, KeyboardAvoidingView } from './components';
// libs
import { navigationRef, onReady, navigate } from './lib/root-navigation';
// styles
import colors from './styles/colors';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
      <RootStack.Screen
        name="SetPhone"
        component={SetPhoneScreen}
        options={{ title: '' }}
      />
      <RootStack.Screen
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
      <RootStack.Screen
        name="SetPhone"
        component={SetPhoneScreen}
        options={{ title: '' }}
      />
      <RootStack.Screen
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

// https://github.com/react-navigation/react-navigation/issues/3971
function SellerStackScreen() {
  return (
    <KeyboardAvoidingView>
      <SellerStack.Navigator
        screenOptions={commonStackOptions}
        initialRouteName="SellerBoot"
      >
        <SellerStack.Screen
          name="SellerBoot"
          component={SellerBootScreen}
          options={{ title: '' }}
        />
        <SellerStack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ title: '' }}
        />
        <SellerStack.Screen
          name="SetPhone"
          component={SetPhoneScreen}
          options={{ title: '' }}
        />
        <SellerStack.Screen
          name="VerifyPhone"
          component={VerifyPhoneScreen}
          options={{ title: '' }}
        />
        <SellerStack.Screen
          name="SelectOrCreateStore"
          component={SelectOrCreateStoreScreen}
          options={{ headerShown: false }}
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
          options={{ title: '' }}
        />
        <SellerStack.Screen
          name="UpdateStoreInfo"
          component={UpdateStoreInfoScreen}
          options={{ title: 'Información de tienda' }}
        />
        <SellerStack.Screen
          name="CreateOrUpdateProduct"
          component={CreateOrUpdateProductScreen}
          options={{ headerTitle: '' }}
        />
        <SellerStack.Screen
          name="CreateOrUpdateService"
          component={CreateOrUpdateServiceScreen}
          options={{ headerTitle: '' }}
        />
        <SellerStack.Screen
          name="MyProducts"
          component={MyProductsScreen}
          options={{ headerTitle: 'Mis productos' }}
        />
        <SellerStack.Screen
          name="MySales"
          component={MySalesScreen}
          options={{ headerTitle: 'Ventas' }}
        />
        <SellerStack.Screen
          name="SaleDetails"
          component={SaleDetailsScreen}
          options={{ headerTitle: 'Detalle de venta' }}
        />
        <SellerStack.Screen
          name="StockVerificaton"
          component={StockVerificationScreen}
          options={{ headerTitle: 'Verificación de stock' }}
        />
      </SellerStack.Navigator>
    </KeyboardAvoidingView>
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
      <MenuStack.Screen
        name="UpdateAccount"
        component={UpdateAccountScreen}
        options={{ title: 'Cuenta' }}
      />
      <MenuStack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: 'Pedidos' }}
      />
      <MenuStack.Screen
        name="Help"
        component={HelpScreen}
        options={{ title: 'Ayuda' }}
      />
      <HomeStack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ title: '' }}
      />
      <RootStack.Screen
        name="SetPhone"
        component={SetPhoneScreen}
        options={{ title: '' }}
      />
      <RootStack.Screen
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
      initialRouteName="HomeStack"
    >
      <MainTab.Screen name="HomeStack" component={HomeStackScreen} />
      <MainTab.Screen name="SearchStack" component={SearchStackScreen} />
      <MainTab.Screen name="SellerStack" component={SellerStackScreen} />
      <MainTab.Screen name="MenuStack" component={MenuStackScreen} />
    </MainTab.Navigator>
  );
}

const RootStack = createStackNavigator();

/**
 * Boot component control de navigation in boot time
 *
 * navigation
 *
 * RootStack
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
  // event handlers
  useEffect(() => {
    const listener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data: any = response.notification.request.content.data.body;
        if (data.navigate) {
          navigate(data.navigate.name, data.navigate.params);
        }
      }
    );
    return () => {
      Notifications.removeNotificationSubscription(listener);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef} onReady={onReady}>
        <RootStack.Navigator
          screenOptions={commonStackOptions}
          initialRouteName="Boot"
        >
          <RootStack.Screen
            name="Boot"
            component={BootScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="Terms"
            component={TermsScreen}
            options={{ title: '' }}
          />
          <RootStack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ title: '' }}
            initialParams={{
              redirect: {
                name: 'MainTab',
              },
            }}
          />
          <RootStack.Screen
            name="SetPhone"
            component={SetPhoneScreen}
            options={{ title: '' }}
            initialParams={{
              redirect: {
                name: 'MainTab',
              },
            }}
          />
          <RootStack.Screen
            name="VerifyPhone"
            component={VerifyPhoneScreen}
            options={{ title: '' }}
            initialParams={{
              redirect: {
                name: 'MainTab',
              },
            }}
          />
          <RootStack.Screen
            name="SetAddress"
            component={SetAddressScreen}
            options={{ title: '' }}
          />
          <RootStack.Screen
            name="MainTab"
            component={MainTabScreen}
            options={{ headerShown: false }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
