import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// components
import KeyboardAvoidingView from '../components/keyboard-avoiding-view';
// navigation
import commonStackOptions from './common-stack-options';
// screens
import {
  SignInScreen,
  SetPhoneScreen,
  VerifyPhoneScreen,
  SellerBootScreen,
  SelectOrCreateStoreScreen,
  SetStoreInfoScreen,
  UpdateStoreInfoScreen,
  SetStoreDeliveryInfoScreen,
  MercadoPagoSignInScreen,
  SellerDashboardScreen,
  CreateOrUpdateProductScreen,
  MyProductsScreen,
  MySalesScreen,
  SaleDetailsScreen,
  StockVerificationScreen,
} from '../screens';

const SellerStack = createStackNavigator();

export default () => {
  // render logic
  return (
    <KeyboardAvoidingView>
      <SellerStack.Navigator
        screenOptions={commonStackOptions}
        initialRouteName="SellerBoot"
      >
        <SellerStack.Screen
          name="SellerBoot"
          component={SellerBootScreen}
          options={{ title: '' }}
        />
        <SellerStack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ title: '' }}
        />
        <SellerStack.Screen
          name="SetPhone"
          component={SetPhoneScreen}
          options={{ title: '' }}
        />
        <SellerStack.Screen
          name="VerifyPhone"
          component={VerifyPhoneScreen}
          options={{ title: '' }}
        />
        <SellerStack.Screen
          name="SelectOrCreateStore"
          component={SelectOrCreateStoreScreen}
          options={{ title: 'Mis tiendas' }}
        />
        <SellerStack.Screen
          name="SetStoreInfo"
          component={SetStoreInfoScreen}
          options={{ title: '' }}
        />
        <SellerStack.Screen
          name="SetStoreDeliveryInfo"
          component={SetStoreDeliveryInfoScreen}
          options={{ title: '' }}
        />
        <SellerStack.Screen
          name="MercadoPagoSignIn"
          component={MercadoPagoSignInScreen}
          options={{ title: '' }}
        />
        <SellerStack.Screen
          name="SellerDashboard"
          component={SellerDashboardScreen}
          options={{ headerShown: false }}
        />
        <SellerStack.Screen
          name="UpdateStoreInfo"
          component={UpdateStoreInfoScreen}
          options={{ title: 'Información de tienda' }}
        />
        <SellerStack.Screen
          name="CreateOrUpdateProduct"
          component={CreateOrUpdateProductScreen}
          options={{ headerTitle: '' }}
        />
        <SellerStack.Screen
          name="MyProducts"
          component={MyProductsScreen}
          options={{ headerTitle: 'Mis productos' }}
        />
        <SellerStack.Screen
          name="MySales"
          component={MySalesScreen}
          options={{ headerTitle: 'Ventas' }}
        />
        <SellerStack.Screen
          name="SaleDetails"
          component={SaleDetailsScreen}
          options={{ headerTitle: 'Detalle de venta' }}
        />
        <SellerStack.Screen
          name="StockVerificaton"
          component={StockVerificationScreen}
          options={{ headerTitle: 'Verificación de stock' }}
        />
      </SellerStack.Navigator>
    </KeyboardAvoidingView>
  );
};
