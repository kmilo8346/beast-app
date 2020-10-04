import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// screens
import {
  SignInScreen,
  SetPhoneScreen,
  HomeScreen,
  StoreScreen,
  CheckoutScreen,
  OrdersScreen,
  OrderDetailsScreen,
} from '../screens';
// navigation
import commonStackOptions from './common-stack-options';

const HomeStack = createStackNavigator();

export default () => {
  return (
    <HomeStack.Navigator screenOptions={commonStackOptions}>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Store"
        component={StoreScreen}
        options={{
          title: '',
        }}
      />
      <HomeStack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          title: '',
        }}
      />
      <HomeStack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: 'Pedidos' }}
      />
      <HomeStack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{ title: 'Detalle de pedido' }}
      />
      <HomeStack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ title: '' }}
      />
      <HomeStack.Screen
        name="SetPhone"
        component={SetPhoneScreen}
        options={{ title: '' }}
      />
    </HomeStack.Navigator>
  );
};
