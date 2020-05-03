import React, { useReducer } from 'react';
import { View, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { SimpleText, Button } from '../../components';
import styles from './style';

const defaultState = {
  address: {
    addressName: 'Edificio Europlaza',
    street: 'Ave. Vicuña Mackenna 625',
    dpto: '926',
    block: 'A',
  },
  inputFocussed: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_DEPARTMENT':
      return {
        ...state,
        address: {
          dpto: action.text,
        },
      };
    case 'SET_INPUT_FOCUS':
      return { ...state, inputFocussed: true };
    case 'SET_INPUT_UNFOCUS':
      return {
        ...state,
        address: {
          dpto: '',
        },
        inputFocussed: false,
      };
    default:
      return defaultState;
  }
};

const InitialDeliveryAddressScreen = ({ navigation }) => {

  const [state, dispatch] = useReducer(reducer, defaultState);
  const addressName = `${state.address.addressName}\n( ${state.address.street} )`;

  blurTextInput = () => {
    dispatch({
      type: 'SET_INPUT_UNFOCUS',
    });
    Keyboard.dismiss();
  };

  getInput = () => (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.inputDpto, state.inputFocussed ? styles.inputFocus : {}]}
        placeholder="Departamento"
        placeholderTextColor="grey"
        onChangeText={(text) =>
          dispatch({
            type: 'SET_DEPARTMENT',
            text,
          })
        }
        value={state.address.dpto}
        onFocus={() =>
          dispatch({
            type: 'SET_INPUT_FOCUS',
          })
        }
      />
      {state.inputFocussed && (
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
    <View style={styles.initialDeliveryAddressScreenContainer}>
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
        type={state.inputFocussed ? 'full' : 'normal'}
        isEnabled={state.address.dpto.length > 2}
        onPress={() => {
          navigation.navigate('StoresScreen');
        }}
      />
    </View>
  );
};

export default InitialDeliveryAddressScreen;
