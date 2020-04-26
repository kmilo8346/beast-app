import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import SimpleText from './SimpleText';
import { scale } from '../util';

const CategoryItem = ({ title }) => {

  const [selected, setSelected] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => setSelected(!selected)}
      style={[
        styles.category,
        { backgroundColor: selected ? 'rgba(255, 154, 61, 0.2)' : '#ffffff' },
      ]}
    >
      <SimpleText text={title} />
    </TouchableOpacity>
  );
};

const CategoriesList = (props) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={props.categories}
        renderItem={({ item }) => <CategoryItem title={item.title} />}
        keyExtractor={(item) => String(item.id)}
        horizontal
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '98%',
    alignItems: 'center',
    marginTop: scale(16),
  },
  category: {
    borderRadius: 5,
    shadowColor: 'rgba(23, 23, 22, 0.05)',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 5,
    shadowOpacity: 1,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(255, 154, 61, 0.4)',
    marginHorizontal: scale(4),
    paddingHorizontal: scale(16),
    paddingVertical: scale(11.5),
  },
});

export default CategoriesList;
