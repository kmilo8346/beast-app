import React from "react";
import { StyleSheet } from "react-native";
import registerRootComponent from "expo/build/launch/registerRootComponent";

import Boot from "./boot";
import User from './containers/user'

function App() {
  return (
    <User.Provider>
      <Boot />
    </User.Provider>

  );
}

const styles = StyleSheet.create({});

export default registerRootComponent(App);
