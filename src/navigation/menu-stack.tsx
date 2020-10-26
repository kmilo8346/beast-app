import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// screens
import {
  SignInScreen,
  SetPhoneScreen,
  MenuScreen,
  ClientOrdersScreen,
  ClientOrderDetailsScreen,
  StoreScreen,
  ProductScreen,
} from '../screens';
// navigation
import commonStackOptions from './common-stack-options';

const MenuStack = createStackNavigator();

export default () => {
  return (
    <MenuStack.Navigator screenOptions={commonStackOptions}>
      <MenuStack.Screen
        name="Menu"
        component={MenuScreen}
        options={{ headerShown: false }}
      />
      <MenuStack.Screen
        name="ClientOrders"
        component={ClientOrdersScreen}
        options={{ title: 'Pedidos' }}
      />
      <MenuStack.Screen
        name="ClientOrderDetails"
        component={ClientOrderDetailsScreen}
        options={{ title: 'Detalle de pedido' }}
      />
      <MenuStack.Screen
        name="Store"
        component={StoreScreen}
        options={{ title: '' }}
      />
      <MenuStack.Screen
        name="Product"
        component={ProductScreen}
        options={{ title: '' }}
      />
      <MenuStack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ title: '' }}
      />
      <MenuStack.Screen
        name="SetPhone"
        component={SetPhoneScreen}
        options={{ title: '' }}
      />
    </MenuStack.Navigator>
  );
};
