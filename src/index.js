import React from "react";
import { StyleSheet } from "react-native";
import registerRootComponent from "expo/build/launch/registerRootComponent";

import Boot from "./boot";

function App() {
  return <Boot />;
}

const styles = StyleSheet.create({});

export default registerRootComponent(App);
