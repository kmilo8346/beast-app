import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// screens
import { OnboardingScreen } from '../screens';
// navigation
import commonStackOptions from './common-stack-options';

const Stack = createStackNavigator();

export default () => {
  return (
    <Stack.Navigator screenOptions={commonStackOptions}>
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
