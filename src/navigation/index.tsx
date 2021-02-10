import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

// navigation
import OboardingStackScreen from './onboarding-stack';
import MainTabScreen from './main-tab';
import ShoppingCartStackScreen from './shopping-cart-stack';
import commonStackOptions from './common-stack-options';
// cache
import genericCache from '../cache/generic';
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
  const initial = genericCache.getOnboarding() ? 'MainTab' : 'OnboardingStack';
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef} onReady={onReady}>
        <Stack.Navigator
          initialRouteName={initial}
          mode="modal"
          screenOptions={commonStackOptions}
        >
          <Stack.Screen
            name="OnboardingStack"
            component={OboardingStackScreen}
            options={{ headerShown: false }}
          />
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
