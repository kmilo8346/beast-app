import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Text,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { SimpleText, Button, BackArrow } from '../../components';

import styles from './style';

const InitialDeliveryAddressScreen = ({ navigation }) => {
  const [dpto, setDepto] = useState('');
  const [focus, setFocus] = useState(false);
  const addressName = 'Edificio Europlaza ( Ave. Vicuña Mackenna 625 )';

  blurTextInput = () => {
    setFocus(!focus);
    setDepto('');
    Keyboard.dismiss();
  };

  getInput = () => (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.inputDpto, focus ? styles.inputFocus : {}]}
        placeholder="Departamento"
        placeholderTextColor="grey"
        onChangeText={(text) => setDepto(text)}
        value={dpto}
        onFocus={() => setFocus(true)}
      />
      {focus && (
        <TouchableOpacity
          style={styles.cleanInput}
          onPress={() => blurTextInput()}
        >
          <FontAwesomeIcon
            size={18}
            color={'rgb(255, 192, 61)'}
            icon={faTimes}
          />
        </TouchableOpacity>
      )}
    </View>
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
          <SimpleText text="Dirección" textStyles={styles.headerTextStyles} />
      </View>
      <View style={styles.body}>
        <SimpleText
          text="Estamos entregando al edificio:"
          textStyles={styles.disclaimerText}
          size={25}
        />
        <SimpleText text={addressName} textStyles={styles.addressName} />
        <SimpleText text="Ver en el Mapa" textStyles={styles.mapLink} />
        <SimpleText text="Te entregaremos en:" textStyles={styles.inputLabel} />
        {getInput()}
      </View>

      <Button
        title="Go to stores"
        type={focus ? 'full' : 'normal'}
        isEnabled={dpto.length > 2}
        onPress={() => {
          navigation.navigate('StoresScreen');
        }}
      />
    </View>
  );
};

export default InitialDeliveryAddressScreen;
