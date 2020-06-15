import React from 'react';
import { View, ViewStyle } from 'react-native';

import Text from '../text';
import colors from '../../styles/colors';
import styles from './styles';

export interface Props {
  count: number;
  style?: ViewStyle;
}

export default ({ count, style = {} }: Props) => {
  const containerStyle = [styles.container, style];
  return (
    <View style={containerStyle}>
      <Text level={7} weight="bold" color={colors.white}>
        {count}
      </Text>
    </View>
  );
};
