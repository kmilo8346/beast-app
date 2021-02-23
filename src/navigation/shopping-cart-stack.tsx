import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// screens
import { ShoppingCartScreen } from '../screens';
// navigation
import commonStackOptions from './common-stack-options';
// components
import Icon from '../components/icon';

const Stack = createStackNavigator();

export default () => {
  return (
    <Stack.Navigator screenOptions={commonStackOptions}>
      <Stack.Screen
        name="ShoppingCart"
        component={ShoppingCartScreen}
        options={{
          title: 'Mi carro',
          headerBackImage: () => <Icon name="x" size={28} />,
        }}
      />
    </Stack.Navigator>
  );
};
