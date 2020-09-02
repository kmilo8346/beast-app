import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

// screens
import {
  BootScreen,
  OnboardingScreen,
  TermsScreen,
  SignInScreen,
  SetPhoneScreen,
  VerifyPhoneScreen,
  SetAddressScreen,
} from '../screens';
// navigation
import MainTabScreen from './main-tab';
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

const RootStack = createStackNavigator();

export default () => {
  // render logic
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef} onReady={onReady}>
        <RootStack.Navigator
          screenOptions={commonStackOptions}
          initialRouteName="Boot"
        >
          <RootStack.Screen
            name="Boot"
            component={BootScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="Terms"
            component={TermsScreen}
            options={{ title: '' }}
          />
          <RootStack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ title: '' }}
            initialParams={{
              redirect: {
                name: 'MainTab',
              },
            }}
          />
          <RootStack.Screen
            name="SetPhone"
            component={SetPhoneScreen}
            options={{ title: '' }}
            initialParams={{
              redirect: {
                name: 'MainTab',
              },
            }}
          />
          <RootStack.Screen
            name="VerifyPhone"
            component={VerifyPhoneScreen}
            options={{ title: '' }}
            initialParams={{
              redirect: {
                name: 'MainTab',
              },
            }}
          />
          <RootStack.Screen
            name="SetAddress"
            component={SetAddressScreen}
            options={{ title: '' }}
          />
          <RootStack.Screen
            name="MainTab"
            component={MainTabScreen}
            options={{ headerShown: false }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
