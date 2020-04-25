import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import registerRootComponent from 'expo/build/launch/registerRootComponent';

function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app mothfoquer!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


export default registerRootComponent(App);