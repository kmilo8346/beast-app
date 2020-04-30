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
  const [isSearching, setIsSearching] = useState(false);

  const goToProduct = () => navigation.navigate('ProductScreen');
  const goToCart = () => {
    return navigation.navigate('CheckoutStack', { screen: 'CartScreen' });
  };

  const onSearching = (flag) => {
    console.log(`isSearching(StoreScreen):${isSearching}`);
    setIsSearching(flag);
  };

  const backToAddress = () => navigation.goBack();

  return (
    <View style={styles.storeScreenContainer}>
      <InsideStoreHeader
        goBack={() => backToAddress}
        storeData={Stores[0]}
        isSearch={() => onSearching}
      />
      <CategoriesList
        isSearching={isSearching}
        categories={Stores[0].categories}
      />
      <ProductList
        goToProduct={() => goToProduct}
        products={Stores[0].products}
      />
    </View>
  );
}
