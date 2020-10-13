import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// screens
import { ShoppingCartScreen, SignInScreen, CheckoutScreen } from '../screens';
// navigation
import commonStackOptions from './common-stack-options';

const ShoppingCartStack = createStackNavigator();

export default () => {
  return (
    <ShoppingCartStack.Navigator screenOptions={commonStackOptions}>
      <ShoppingCartStack.Screen
        name="ShoppingCart"
        component={ShoppingCartScreen}
        options={{ title: 'Mi carro' }}
      />
      <ShoppingCartStack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ title: '' }}
      />
      <ShoppingCartStack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          title: '',
        }}
      />
    </ShoppingCartStack.Navigator>
  );
};
