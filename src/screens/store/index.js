import React, { useState } from 'react';
import { Image, View, StyleSheet, Text, Button } from 'react-native';

import {
  ProductList,
  CategoriesList,
  InsideStoreHeader,
} from '../../components';

import styles from './style';
import Stores from '../../services/data/dummyStores';

export default function StoreScreen({ navigation }) {
  const goToProduct = () => navigation.navigate('ProductScreen');
  const goToCart = () =>
    navigation.navigate('CheckoutStack', { screen: 'CartScreen' });
  return (
    <View style={styles.storeScreenContainer}>
      <InsideStoreHeader
        goBack={() => navigation.goBack()}
        storeData={Stores[0]}
      />
      <CategoriesList categories={Stores[0].categories} />
      <ProductList
        goToProduct={() => navigation.navigate('ProductScreen')}
        products={Stores[0].products}
      />
    </View>
  );
}
