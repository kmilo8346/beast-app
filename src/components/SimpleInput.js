import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import Images from '../assets';

import { scale } from '../util';

const SimpleInput = ({
  placeholder,
  placeholderStyle,
  isSearcher,
  textAlign,
  inpStyles,
  onSearch,
}) => {
  const [search, setSearch] = useState(undefined);
  const [focus, setFocus] = useState(false);

  const blurTextInput = () => {
    setFocus(false);
    onSearch(false);
    setSearch(undefined);
    Keyboard.dismiss();
  };

  const onFocusInput = () => {
    setFocus(true);
    onSearch(true);
  };

  return (
    <View style={[styles.inputContainer, { ...inpStyles }]}>
      <TextInput
        style={[styles.inputSearch, focus ? styles.inputFocus : {}]}
        placeholder={placeholder}
        placeholderTextColor="#a4a4a4"
        textAlign={''}
        onChangeText={(searchTerm) => setSearch(searchTerm)}
        value={search}
        onFocus={() => onFocusInput()}
      />
      {isSearcher && (
        <Image style={styles.searchIcon} source={Images.SearchIcon} />
      )}
      {focus && (
        <View style={styles.clearInputContainer}>
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
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 347,
    height: 40,
  },
  clearInputContainer: {
    width: '100%',
    alignItems: 'flex-end',
    position: 'absolute',
    paddingRight: 5,
  },
  inputSearch: {
    width: 347,
    height: 40,
    flex: 1,
    borderRadius: 32,
    backgroundColor: 'rgba(229, 229, 229,1)',
    borderStyle: 'solid',
    borderWidth: 1,
    paddingLeft: scale(35),
    borderColor: '#e5e5e5',
  },
  inputFocus: {
    borderColor: 'rgb(255, 192, 61)',
  },
  cleanInput: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
    borderRadius: 50,
    backgroundColor: 'rgba(229, 229, 229, 0.2)',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgb(255, 192, 61)',
  },
  searchIcon: {
    position: 'absolute',
    marginLeft: 10,
    width: 18,
    height: 18,
  },
});

export default SimpleInput;
