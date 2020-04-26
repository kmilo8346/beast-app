import React from "react";
import { View, Text, Button } from "react-native";

export default function TutorialScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Tutorial Screen</Text>
      <Button
        title="Go to initial delivery address screen"
        onPress={() => {
          navigation.navigate("InitialDeliveryAddressScreen");
        }}
      />
    </View>
  );
}
