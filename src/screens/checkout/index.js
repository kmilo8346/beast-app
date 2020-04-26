import React from "react";
import { View, Button } from "react-native";

export default function CheckoutScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button
        title="Go to cart screen"
        onPress={() => navigation.push("CartScreen")}
      />
      <Button
        title="Go to delivery address screen"
        onPress={() => navigation.navigate("SetDeliveryAddressScreen")}
      />
      <Button
        title="Go to set phone screen"
        onPress={() => navigation.navigate("SetPhoneScreen")}
      />
      <Button
        title="Go to set email screen"
        onPress={() => navigation.navigate("SetEmailScreen")}
      />
      <Button
        title="Go to register payment screen"
        onPress={() => navigation.navigate("SetPaymentScreen")}
      />
    </View>
  );
}
