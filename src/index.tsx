import React from "react";
import { StyleSheet, View,Text } from "react-native";
import registerRootComponent from "expo/build/launch/registerRootComponent";



function App() {
  return (
    <View>
        <Text>Hello World!</Text>
    </View>
  );
}

const styles = StyleSheet.create({});

export default registerRootComponent(App);
