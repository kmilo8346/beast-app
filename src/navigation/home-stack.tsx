import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// screens
import {
  HomeScreen,
  SearchScreen,
  ProductScreen,
  StoresScreen,
  StoreScreen,
  ClientOrdersScreen,
  ClientOrderDetailsScreen,
  SellerOrderDetailsScreen,
} from '../screens';
// navigation
import commonStackOptions from './common-stack-options';

const Stack = createStackNavigator();

export default () => {
  return (
    <Stack.Navigator screenOptions={commonStackOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Product"
        component={ProductScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="Stores"
        component={StoresScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="Store"
        component={StoreScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="ClientOrders"
        component={ClientOrdersScreen}
        options={{ title: 'Pedidos' }}
      />
      <Stack.Screen
        name="ClientOrderDetails"
        component={ClientOrderDetailsScreen}
        options={{ title: 'Detalle de pedido' }}
      />
      <Stack.Screen
        name="SellerOrderDetails"
        component={SellerOrderDetailsScreen}
        options={{ title: 'Detalle de orden' }}
      />
    </Stack.Navigator>
  );
};
