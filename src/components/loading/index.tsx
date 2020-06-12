import React from 'react';
import { ActivityIndicator, View, ActivityIndicatorProps } from 'react-native';

import colors from '../../styles/colors';
import styles from './styles';

export default ({
  size = 'large',
  color = colors.blue,
}: ActivityIndicatorProps) => {
  return (
    <View style={[styles.container, styles.horizontal]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};
