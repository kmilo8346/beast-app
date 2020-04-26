import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import {
  TutorialScreen,
  InitialDeliveryAddressScreen,
  StoresScreen,
  StoreScreen,
  ProductScreen,
  CartScreen,
  CheckoutScreen,
  SetDeliveryAddressScreen,
  SetEmailScreen,
  SetPhoneScreen,
  SetPaymentScreen,
} from "./screens";

function MainStackNavigator() {
  const MainStack = createStackNavigator();
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="TutorialScreen"
        component={TutorialScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="InitialDeliveryAddressScreen"
        component={InitialDeliveryAddressScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen name="StoresScreen" component={StoresScreen} />
      <MainStack.Screen name="StoreScreen" component={StoreScreen} />
      <MainStack.Screen
        key="product"
        name="ProductScreen"
        component={ProductScreen}
      />
    </MainStack.Navigator>
  );
}

function CheckoutStackNavigator() {
  const CheckoutStack = createStackNavigator();
  return (
    <CheckoutStack.Navigator initialRouteName="CartScreen">
      <CheckoutStack.Screen name="CartScreen" component={CartScreen} />
      <CheckoutStack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      <CheckoutStack.Screen
        name="SetDeliveryAddressScreen"
        component={SetDeliveryAddressScreen}
      />
      <CheckoutStack.Screen name="SetPhoneScreen" component={SetPhoneScreen} />
      <CheckoutStack.Screen name="SetEmailScreen" component={SetEmailScreen} />
      <CheckoutStack.Screen
        name="SetPaymentScreen"
        component={SetPaymentScreen}
      />
    </CheckoutStack.Navigator>
  );
}

function RootStackStackNavigator() {
  const RootStack = createStackNavigator();
  return (
    <RootStack.Navigator mode="modal" initialRouteName="MainStack">
      <RootStack.Screen
        name="MainStack"
        component={MainStackNavigator}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="CheckoutStack"
        component={CheckoutStackNavigator}
        options={{ headerShown: false }}
      />
    </RootStack.Navigator>
  );
}

/**
 * Boot component control de navigation in boot time
 */
function Boot() {
  // TODO: use react context to pass navigatin state
  // https://reactnavigation.org/docs/hello-react-navigation/#passing-additional-props

  return (
    <NavigationContainer>
      <RootStackStackNavigator />
    </NavigationContainer>
  );
}

export default Boot;
