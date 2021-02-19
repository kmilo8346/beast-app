import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// screens
import { ShoppingCartScreen } from '../screens';
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
    </Stack.Navigator>
  );
};
