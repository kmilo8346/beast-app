import React from "react";
import { View, Text, Button } from "react-native";

export default function StoresScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button
        title="Go to store screen"
        onPress={() => navigation.navigate("StoreScreen")}
      />
      <Button
        title="Go to cart screen"
        onPress={() =>
          navigation.navigate("CheckoutStack", { screen: "CartScreen" })
        }
      />
    </View>
  );
}
