import React from "react";
import { StyleSheet } from "react-native";
import registerRootComponent from "expo/build/launch/registerRootComponent";

import { User, Bag } from "./containers";
import Boot from "./boot";

function GlobalState({ children }) {
  return (
    <Bag.Provider>
      <User.Provider>{children}</User.Provider>
    </Bag.Provider>
  );
}

function App() {
  return (
    <GlobalState>
      <Boot></Boot>
    </GlobalState>
  );
}

const styles = StyleSheet.create({});

export default registerRootComponent(App);
