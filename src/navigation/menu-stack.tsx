import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// screens
import {
  SignInScreen,
  SetPhoneScreen,
  VerifyPhoneScreen,
  MenuScreen,
  UpdateAccountScreen,
  OrdersScreen,
  HelpScreen,
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
      <MenuStack.Screen
        name="VerifyPhone"
        component={VerifyPhoneScreen}
        options={{ title: '' }}
      />
    </MenuStack.Navigator>
  );
};
