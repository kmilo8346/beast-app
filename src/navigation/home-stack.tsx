import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// screens
import {
  HomeScreen,
  SearchScreen,
  ProductScreen,
  StoresScreen,
  StoreScreen,
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
    </Stack.Navigator>
  );
};
