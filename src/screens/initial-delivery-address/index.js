import React from "react";
import { View, Text, Button } from "react-native";

export default function InitialDeliveryAddressScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Initial Delivery Address Screen</Text>
      <Button
        title="Go to stores"
        onPress={() => {
          navigation.navigate("StoresScreen");
        }}
      />
    </View>
  );
}
