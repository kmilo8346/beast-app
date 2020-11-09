import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// screens
import {
  ShoppingCartScreen,
  SetPhoneScreen,
  VerifyPhoneScreen,
  AddUserDataScreen,
} from '../screens';
// navigation
import commonStackOptions from './common-stack-options';

const Stack = createStackNavigator();

export default () => {
  return (
    <Stack.Navigator screenOptions={commonStackOptions}>
      <Stack.Screen
        name="ShoppingCart"
        component={ShoppingCartScreen}
        options={{ title: 'Mi carro' }}
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
    </Stack.Navigator>
  );
};
