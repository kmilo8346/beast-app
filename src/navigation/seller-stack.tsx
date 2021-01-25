import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// components
import KeyboardAvoidingView from '../components/keyboard-avoiding-view';
// navigation
import commonStackOptions from './common-stack-options';
// screens
import {
  MyStoreScreen,
  SetPhoneScreen,
  VerifyPhoneScreen,
  AddUserDataScreen,
  CreateStoreWizzardSetNameScreen,
  CreateStoreWizzardSetImageScreen,
  CreateStoreWizzardSetDeliveryAreaScreen,
  EditStoreScreen,
  EditStoreSetImageScreen,
  EditStoreSetNameScreen,
  EditStoreSetDescriptionScreen,
  EditStoreSetDeliveryAreaScreen,
  EditStoreSetDeliveryTimeScreen,
  EditStoreSetOpeningHoursScreen,
  EditStoreSetDayOpeningHoursScreen,
  UpsertStoreScreen,
  UpsertProductScreen,
  SellerOrdersScreen,
  SellerOrderDetailsScreen,
} from '../screens';

const Stack = createStackNavigator();

export default () => {
  // render logic
  return (
    <KeyboardAvoidingView>
      <Stack.Navigator screenOptions={commonStackOptions}>
        <Stack.Screen
          name="MyStore"
          component={MyStoreScreen}
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
          name="AddUserData"
          component={AddUserDataScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="CreateStoreWizzardSetName"
          component={CreateStoreWizzardSetNameScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="CreateStoreWizzardSetImage"
          component={CreateStoreWizzardSetImageScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="CreateStoreWizzardSetDeliveryArea"
          component={CreateStoreWizzardSetDeliveryAreaScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="EditStore"
          component={EditStoreScreen}
          options={{ title: 'Configurando tienda' }}
        />
        <Stack.Screen
          name="EditStoreSetImage"
          component={EditStoreSetImageScreen}
          options={{ title: 'Imagen' }}
        />
        <Stack.Screen
          name="EditStoreSetName"
          component={EditStoreSetNameScreen}
          options={{ title: 'Nombre' }}
        />
        <Stack.Screen
          name="EditStoreSetDescription"
          component={EditStoreSetDescriptionScreen}
          options={{ title: 'Descripción' }}
        />
        <Stack.Screen
          name="EditStoreSetDeliveryArea"
          component={EditStoreSetDeliveryAreaScreen}
          options={{ title: 'Área de despacho' }}
        />
        <Stack.Screen
          name="EditStoreSetDeliveryTime"
          component={EditStoreSetDeliveryTimeScreen}
          options={{ title: 'Tiempo de entrega' }}
        />
        <Stack.Screen
          name="EditStoreSetOpeningHours"
          component={EditStoreSetOpeningHoursScreen}
          options={{ title: 'Horario de atención' }}
        />
        <Stack.Screen
          name="EditStoreSetDayOpeningHours"
          component={EditStoreSetDayOpeningHoursScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="UpsertStore"
          component={UpsertStoreScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="UpsertProduct"
          component={UpsertProductScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="SellerOrders"
          component={SellerOrdersScreen}
          options={{ title: 'Órdenes' }}
        />
        <Stack.Screen
          name="SellerOrderDetails"
          component={SellerOrderDetailsScreen}
          options={{ title: 'Detalle de orden' }}
        />
      </Stack.Navigator>
    </KeyboardAvoidingView>
  );
};
