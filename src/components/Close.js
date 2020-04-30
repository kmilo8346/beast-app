import React from 'react';
import { View, StyleSheet } from 'react-native';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { scale } from '../util';

const Close = ({ styles }) => {
  return (
    <View style={defaultStyles.container}>
      <FontAwesomeIcon size={17} icon={faTimes} style={{ ...styles }} />
    </View>
  );
};

const defaultStyles = StyleSheet.create({
  container: {
    width: scale(24),
    height: scale(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Close;
