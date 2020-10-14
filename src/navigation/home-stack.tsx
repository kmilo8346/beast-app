import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// screens
import {
  SignInScreen,
  HomeScreen,
  ProductScreen,
  StoresScreen,
  StoreScreen,
  OrdersScreen,
  OrderDetailsScreen,
} from '../screens';
// navigation
import commonStackOptions from './common-stack-options';

const HomeStack = createStackNavigator();

export default () => {
  return (
    <HomeStack.Navigator screenOptions={commonStackOptions}>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Product"
        component={ProductScreen}
        options={{ title: '' }}
      />
      <HomeStack.Screen
        name="Stores"
        component={StoresScreen}
        options={{ title: 'Tiendas' }}
      />
      <HomeStack.Screen
        name="Store"
        component={StoreScreen}
        options={{ title: '' }}
      />
      <HomeStack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: 'Pedidos' }}
      />
      <HomeStack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{ title: 'Detalle de pedido' }}
      />
      <HomeStack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ title: '' }}
      />
    </HomeStack.Navigator>
  );
};
