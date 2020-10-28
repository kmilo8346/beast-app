import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// components
import KeyboardAvoidingView from '../components/keyboard-avoiding-view';
// navigation
import commonStackOptions from './common-stack-options';
// screens
import {
  MyStoreScreen,
  SignInScreen,
  MyStoreMenu,
  UpsertStoreScreen,
  UpsertProductScreen,
  SellerOrdersScreen,
  SellerOrderDetailsScreen,
} from '../screens';

const Stack = createStackNavigator();

export default () => {
  // render logic
  return (
    <KeyboardAvoidingView>
      <Stack.Navigator screenOptions={commonStackOptions}>
        <Stack.Screen
          name="MyStore"
          component={MyStoreScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="MyStoreMenu"
          component={MyStoreMenu}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="UpsertStore"
          component={UpsertStoreScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="UpsertProduct"
          component={UpsertProductScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="SellerOrders"
          component={SellerOrdersScreen}
          options={{ title: 'Mis órdenes' }}
        />
        <Stack.Screen
          name="SellerOrderDetails"
          component={SellerOrderDetailsScreen}
          options={{ title: 'Detalle de orden' }}
        />
      </Stack.Navigator>
    </KeyboardAvoidingView>
  );
};
