import React, { useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

import { BackArrow, SimpleText, Button } from '../../components';
import Images from '../../assets';

import styles from './style';

const defaultProduct = {
  title: 'Pie de Manzana',
  price: '$ 5.000',
  weigth: '800g',
  description:
    'Ingredietes: Manzana, Harina de trigo, azucar, edulcorantes y preservantes, agua purificada, mermelada de manzana',
};

const ProductScreen = ({ navigation, productDetails = defaultProduct }) => {
  const [cant, setCant] = useState(0);
  const [added, setAdded] = useState(false);

  const { goBack } = navigation;
  const { title, price, weigth, description } = productDetails;

  const goToCart = () => {
    return navigation.navigate('CheckoutStack', { screen: 'CartScreen' });
  };

  const keepBuying = () => {
    return added ? navigation.goBack() : addCant();
  };

  const addCant = () => {
    setCant((cant) => cant + 1);
    if (cant === 0) {
      setAdded(() => true);
    }
  };

  const subCant = () => {
    setCant((cant) => cant - 1);
    if (cant === 1) {
      setAdded(false);
    }
  };

  const cantControlers = () => {
    return (
      <View style={styles.cantControlers}>
        <TouchableOpacity disabled={cant <= 0} onPress={() => subCant()}>
          <FontAwesomeIcon size={17} icon={faMinus} />
        </TouchableOpacity>
        <SimpleText text={cant > 0 ? cant : 0} textStyles={styles.cantLabel} />
        <TouchableOpacity onPress={() => addCant()}>
          <FontAwesomeIcon size={17} icon={faPlus} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.productDetailContainer}>
      <BackArrow onPress={goBack} />
      <Image style={styles.productDetailImage} source={Images.DefaultPie} />
      <SimpleText text={title} textStyles={styles.productName} />
      <SimpleText text={weigth} textStyles={styles.productDetailsWeigth} />
      <View style={styles.addSubBtnPriceContainer}>
        {cantControlers()}
        <SimpleText text={price} textStyles={styles.productDetailPrice} />
      </View>
      <SimpleText text="Detalles:" textStyles={styles.productDetailsTitle} />
      <SimpleText text={description} textStyles={styles.productDetails} />
      <Button
        title={added ? 'Seguir comprando' : 'Añadir a tu compra'}
        positionStyles={styles.addToCarButton}
        isEnabled
        type="normal"
        onPress={() => keepBuying()}
      />
    </View>
  );
};

export default ProductScreen;
