import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createStackNavigator,
  StackHeaderTitleProps,
  StackNavigationOptions,
} from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  HomeScreen,
  PLPScreen,
  PLPInStoreScreen,
  PDPScreen,
  CheckoutScreen,
  ToSaleScreen,
  MenuScreen,
} from './screens';
import { Icon, Text } from './components';
import { navigationRef } from './lib/root-navigation';
import colors from './styles/colors';

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
        options={{ title: 'Buscar' }}
      />
      <HomeStack.Screen name="PLPInStore" component={PLPInStoreScreen} />
      <HomeStack.Screen
        name="PDP"
        component={PDPScreen}
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

const ToSaleStack = createStackNavigator();

function ToSaleStackScreen() {
  return (
    <ToSaleStack.Navigator screenOptions={commonStackOptions}>
      <ToSaleStack.Screen
        name="ToSale"
        component={ToSaleScreen}
        options={{ headerShown: false }}
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
    </MenuStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

/**
 * Boot component control de navigation in boot time
 */
function Boot() {
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let name;
              switch (route.name) {
                case 'ToSale':
                  name = 'tag';
                  break;
                case 'Menu':
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
                case 'ToSale':
                  text = 'Vender';
                  break;
                case 'Menu':
                  text = 'Más';
                  break;
                default:
                  text = 'Inicio';
                  break;
              }
              return <Text level={8}>{text}</Text>;
            },
          })}
          tabBarOptions={{
            activeTintColor: colors.blue,
            inactiveTintColor: colors.black,
          }}
        >
          <Tab.Screen name="Home" component={HomeStackScreen} />
          <Tab.Screen name="ToSale" component={ToSaleStackScreen} />
          <Tab.Screen name="Menu" component={MenuStackScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default Boot;
