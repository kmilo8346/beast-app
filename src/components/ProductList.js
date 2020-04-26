import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

import SimpleText from './SimpleText';
import Images from '../assets';

import { scale } from '../util';

const ProductItem = ({ product: { weigth, price, description } }) => {
  const [cant, setCant] = useState(0);
  return (
    <View style={styles.productItemContainer}>
      <Image source={Images.DefaultPie} style={styles.image} />
      <SimpleText text={`$ ${price}`} textStyles={styles.price} />
      <SimpleText text={`${description}`} textStyles={styles.title} />
      <View style={styles.lastLine}>
        <SimpleText
          text={`${weigth < 1000 ? weigth + ' g' : weigth / 1000 + ' kg'}`}
          textStyles={styles.weigth}
        />
        <View style={styles.buttonsContainer}>
          {cant <= 0 && (
            <TouchableOpacity onPress={() => setCant((cant) => cant + 1)}>
              <Image source={Images.BagOrangeIcon} style={styles.bag} />
            </TouchableOpacity>
          )}
          {cant > 0 && (
            <View style={styles.operations}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setCant((cant) => cant - 1)}
              >
                <FontAwesomeIcon size={17} color="#ff9a3d" icon={faMinus} />
              </TouchableOpacity>
              <SimpleText text={`${cant}x`} />
              <TouchableOpacity
                style={styles.button}
                onPress={() => setCant((cant) => cant + 1)}
              >
                <FontAwesomeIcon size={17} color="#ff9a3d" icon={faPlus} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const ProductList = ({ products }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductItem product={item} />}
        keyExtractor={(item) => item.sku}
        numColumns={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: scale(16),
    marginLeft: scale(16),
  },
  productItemContainer: {
    width: scale(164),
    height: scale(190),
    borderRadius: scale(15),
    backgroundColor: '#ffffff',
    paddingLeft: scale(12),
    paddingTop: scale(16),
    marginRight: scale(15),
    marginBottom: scale(16),
  },
  image: {
    width: scale(100),
    height: scale(70),
    borderRadius: scale(5),
    backgroundColor: 'rgba(0, 110, 0, 0.5)',
    marginLeft: scale(22),
  },
  title: {
    marginTop: scale(4),
  },
  price: {
    height: scale(22),
    fontSize: scale(18),
    fontWeight: '600',
    marginTop: scale(15),
  },
  lastLine: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: scale(5),
  },
  weigth: {
    color: 'grey',
  },
  buttonsContainer: {
    width: scale(110),
    paddingRight: scale(8),
  },
  operations: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: scale(4),
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 154, 61, 0.2)',
  },
  bag: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(2),
    alignSelf: 'flex-end',
  },
});

export default ProductList;
