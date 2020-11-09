import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

// navigation
import MainTabScreen from './main-tab';
import ShoppingCartStackScreen from './shopping-cart-stack';
import commonStackOptions from './common-stack-options';
// libs
import { navigationRef, onReady } from '../lib/root-navigation';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createStackNavigator();

export default () => {
  // render logic
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef} onReady={onReady}>
        <Stack.Navigator mode="modal" screenOptions={commonStackOptions}>
          <Stack.Screen
            name="MainTab"
            component={MainTabScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ShoppingCartStack"
            component={ShoppingCartStackScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
