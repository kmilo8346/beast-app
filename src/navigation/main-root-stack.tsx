import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// navigation
import MainTabScreen from './main-tab';
import ShoppingCartStackScreen from './shopping-cart-stack';
import commonStackOptions from './common-stack-options';
// screens
import { MyStoreMenu } from '../screens';

const MainRootStack = createStackNavigator();

export default () => {
  // render logic
  return (
    <MainRootStack.Navigator mode="modal" screenOptions={commonStackOptions}>
      <MainRootStack.Screen
        name="MainTab"
        component={MainTabScreen}
        options={{ headerShown: false }}
      />
      <MainRootStack.Screen
        name="ShoppingCartStack"
        component={ShoppingCartStackScreen}
        options={{ headerShown: false }}
      />
      <MainRootStack.Screen
        name="MyStoreMenu"
        component={MyStoreMenu}
        options={{ title: '' }}
      />
    </MainRootStack.Navigator>
  );
};
