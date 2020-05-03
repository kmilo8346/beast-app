import React, { useState } from 'react';
import { Image, View, StyleSheet, TouchableOpacity } from 'react-native';

import { scale } from '../../../util';
import Images from '../../../assets';
import {
  BackArrow,
  Close,
  SimpleInput,
  SimpleText,
  ScheduleInfo,
} from '../../../components';

const InsideStoreHeader = ({ storeData, goBack, isSearch }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const onFocus = (isSearching) => {
    setSearchFocused(isSearching);
    isSearch(searchFocused);
  };
  return (
    <View
      style={[
        styles.insideStoreHeader,
        searchFocused ? styles.insideStoreHeaderCont : {},
      ]}
    >
      <Image source={Images.VegetalesFrescos} style={styles.headerImg} />
      <View style={styles.headerInfo}>
        <View style={styles.searchNav}>
          <TouchableOpacity onPress={() => goBack()}>
            {!searchFocused && (
              <BackArrow styles={{ color: 'white', marginRigth: scale(20) }} />
            )}
            {searchFocused && (
              <Close styles={{ color: 'white', marginRigth: scale(20) }} />
            )}
          </TouchableOpacity>
          <SimpleInput
            placeholder="Buscar aquí..."
            placeholderPosition="center"
            isSearcher
            textAlign="center"
            inpStyles={styles.searchInput}
            onSearch={onFocus}
          />
        </View>
        {!searchFocused && (
          <SimpleText
            text={storeData.title}
            textStyles={{
              fontSize: scale(24),
              fontWeight: '600',
              fontStyle: 'normal',
              letterSpacing: scale(0),
              color: '#ffffff',
              marginTop: scale(24),
              marginBottom: scale(16),
              marginLeft: scale(32),
            }}
          />
        )}
        {!searchFocused && (
          <ScheduleInfo store={storeData} styleSch={styles.schedulesInfo} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  insideStoreHeader: {
    width: scale(375),
    height: scale(197),
  },
  insideStoreHeaderCont: {
    height: scale(104),
  },
  headerImg: {
    width: '100%',
    height: '100%',
  },
  headerInfo: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
  },
  searchNav: {
    width: 500,
    height: scale(40),
    paddingLeft: scale(19),
    flexDirection: 'row',
    marginTop: scale(48),
    alignItems: 'center',
  },
  searchInput: {
    marginLeft: scale(24),
    width: scale(247),
  },
  schedulesInfo: {
    justifyContent: 'flex-start',
    marginLeft: scale(12),
  },
});

export default InsideStoreHeader;
