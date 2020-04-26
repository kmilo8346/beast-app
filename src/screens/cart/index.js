import React from "react";
import { View, Button } from "react-native";

export default function CartScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button
        title="Go to checkout screen"
        onPress={() => navigation.navigate("CheckoutScreen")}
      />
    </View>
  );
}
