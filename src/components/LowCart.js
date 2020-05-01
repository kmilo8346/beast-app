import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';

const LowCart = () => {
  return (
    <TouchableWithoutFeedback style={styles.container}>
      <View style={styles.line} />
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 99,
    backgroundColor: '#171716',
    position: 'absolute',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  line: {
    width: 64,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginTop: 11,
  },
  infoContainer: {
    height: 32,
    width: '100%',
    alignItems: 'center',
  },
  label: {
    color: '#ffffff',
  },
  itemsAddedContainer: {
    paddingRight: 12,
  },
  itemAdded: {
    width: 32,
    height: 32,
    borderRadius: 28,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 28,
    backgroundColor: '#ffffff',
  },
  cant: {
    width: 32,
    height: 32,
    borderRadius: 28,
  },
});

export default LowCart;
