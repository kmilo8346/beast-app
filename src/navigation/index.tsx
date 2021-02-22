import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

// navigation
import OboardingStackScreen from './onboarding-stack';
import MainTabScreen from './main-tab';
import ShoppingCartStackScreen from './shopping-cart-stack';
import commonStackOptions from './common-stack-options';
// clients
import deviceClient, { getDeviceData } from '../clients/device-client';
// cache
import userCache from '../cache/user';
import genericCache from '../cache/generic';
// libs
import Analytics from '../lib/analytics';
import Sentry, { capture } from '../lib/sentry';
import { navigationRef, onReady } from '../lib/root-navigation';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const prefix = '[navigation index]';
const Stack = createStackNavigator();

export default () => {
  // event handlders
  useEffect(() => {
    const unsubscribe = userCache.onChange(async (data) => {
      // indetify user in sentry
      const user: Sentry.Native.User = {
        id: undefined,
        first_name: undefined,
        email: undefined,
        phone: undefined,
      };
      if (data?.id) {
        user.id = data.id;
      }
      if (data?.first_name) {
        user.username = data.first_name;
      }
      if (data?.email) {
        user.email = data.email;
      }
      if (data?.phone) {
        user.phone = data.phone;
      }
      Sentry.Native.setUser(user);

      // sync device
      if (genericCache.getDeviceId()) {
        try {
          const data = await getDeviceData();
          await deviceClient.updateOrCreate({
            pathVars: { id: genericCache.getDeviceId() },
            body: data,
            source: ['id'],
          });
        } catch (error) {
          capture(prefix, 'User on change update device error', error);
        }
      }

      // identify user in google analytics
      try {
        await Analytics.setUserId(data?.id || null);
      } catch (error) {
        capture(
          prefix,
          'User on change sending data to analytics error',
          error
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // render logic
  const initial = genericCache.getOnboarding() ? 'MainTab' : 'OnboardingStack';
  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          const routeName = navigationRef.current?.getCurrentRoute()?.name;
          if (routeName) {
            Analytics.setCurrentScreen(routeName);
          }
          onReady();
        }}
        onStateChange={() => {
          const currentRouteName = navigationRef.current?.getCurrentRoute()
            ?.name;
          Analytics.setCurrentScreen(currentRouteName);
        }}
      >
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
