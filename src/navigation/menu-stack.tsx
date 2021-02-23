import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// screens
import {
  SetPhoneScreen,
  VerifyPhoneScreen,
  MenuScreen,
  EditUserScreen,
  SetUserPhotoScreen,
  SetUserFirstNameScreen,
  SetUserLastNameScreen,
  SetUserEmailScreen,
} from '../screens';
// components
import KeyboardAvoidingView from '../components/keyboard-avoiding-view';
// navigation
import commonStackOptions from './common-stack-options';

const Stack = createStackNavigator();

export default () => {
  return (
    <KeyboardAvoidingView>
      <Stack.Navigator screenOptions={commonStackOptions}>
        <Stack.Screen
          name="Menu"
          component={MenuScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SetPhone"
          component={SetPhoneScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="VerifyPhone"
          component={VerifyPhoneScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="EditUserData"
          component={EditUserScreen}
          options={{ title: 'Edita tus datos' }}
        />
        <Stack.Screen
          name="SetUserPhoto"
          component={SetUserPhotoScreen}
          options={{ title: 'Foto' }}
        />
        <Stack.Screen
          name="SetUserFirstName"
          component={SetUserFirstNameScreen}
          options={{ title: 'Nombre' }}
        />
        <Stack.Screen
          name="SetUserLastName"
          component={SetUserLastNameScreen}
          options={{ title: 'Apellido' }}
        />
        <Stack.Screen
          name="SetUserEmail"
          component={SetUserEmailScreen}
          options={{ title: 'Email' }}
        />
      </Stack.Navigator>
    </KeyboardAvoidingView>
  );
};
