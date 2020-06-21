import React from 'react';
import { ActivityIndicator, View, ActivityIndicatorProps } from 'react-native';

import colors from '../../styles/colors';
import styles from './styles';

export default ({
  size = 'small',
  color = colors.black,
}: ActivityIndicatorProps) => {
  return (
    <View style={[styles.container]}>
      <ActivityIndicator size={size} color={color} style={styles.indicator} />
    </View>
  );
};
