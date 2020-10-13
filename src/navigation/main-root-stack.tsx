import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// navigation
import MainTabScreen from './main-tab';
import ShoppingCartStackScreen from './shopping-cart-stack';

const MainRootStack = createStackNavigator();

export default () => {
  // render logic
  return (
    <MainRootStack.Navigator mode="modal">
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
    </MainRootStack.Navigator>
  );
};
