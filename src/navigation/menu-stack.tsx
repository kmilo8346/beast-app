import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// screens
import {
  SetPhoneScreen,
  VerifyPhoneScreen,
  AddUserDataScreen,
  MenuScreen,
  EditUserDataScreen,
  ClientOrdersScreen,
  ClientOrderDetailsScreen,
  StoreScreen,
  ProductScreen,
} from '../screens';
// navigation
import commonStackOptions from './common-stack-options';

const Stack = createStackNavigator();

export default () => {
  return (
    <Stack.Navigator screenOptions={commonStackOptions}>
      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SetPhone"
        component={SetPhoneScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="VerifyPhone"
        component={VerifyPhoneScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="AddUserData"
        component={AddUserDataScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="EditUserData"
        component={EditUserDataScreen}
        options={{ title: 'Edita tus datos' }}
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
        name="Store"
        component={StoreScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="Product"
        component={ProductScreen}
        options={{ title: '' }}
      />
    </Stack.Navigator>
  );
};
