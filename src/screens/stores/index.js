import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import styles from './style';

import { StoresList } from '../../components';
import Stores from '../../services/data/dummyStores';

const StoresScreen = ({ navigation }) => {
  const goToStore = () => {
    return navigation.navigate('StoreScreen');
  };
  // TODO: Add vista abajo del cart abajo cuando tenga items
  const goToCart = () => {
    return navigation.navigate('CheckoutStack', { screen: 'CartScreen' });
  };

  return (
    <View style={styles.storesScreenContainer}>
      <StoresList goToStore={goToStore} data={Stores} />
    </View>
  );
};

export default StoresScreen;
