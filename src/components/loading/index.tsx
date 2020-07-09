import React from 'react';
import { ActivityIndicator, View, ActivityIndicatorProps } from 'react-native';

// components
import Text from '../text';
// styles
import colors from '../../styles/colors';
import styles from './styles';

export interface LoadingProps extends ActivityIndicatorProps {
  message?: string;
}

export default ({
  size = 'small',
  color = colors.black,
  message = 'Cargando...',
  ...otherProps
}: LoadingProps) => {
  return (
    <View style={[styles.container]}>
      <ActivityIndicator
        {...otherProps}
        size={size}
        color={color}
        style={[styles.indicator, otherProps.style]}
      />
      <Text level={7} weight="bold" style={styles.message}>
        {message}
      </Text>
    </View>
  );
};
