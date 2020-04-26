import React from "react";
import { View, Text } from "react-native";

export default function PhoneScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Introduzca su phone y valide con code</Text>
    </View>
  );
}
