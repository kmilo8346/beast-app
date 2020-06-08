import React from 'react';
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { Icon, Text } from '../../../../components';
import styles from './styles';
import colors from '../../../../styles/colors';

export interface Props {
  name: string;
  description: string;
  icon?: string;
  onPress: () => void;
}

export default ({
  name,
  description,
  icon = 'chevron-right',
  onPress,
}: Props) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.textContainer}>
        <Text level={4} style={styles.name}>
          {name}
        </Text>
        <Text level={6} color={colors.blackLight3} style={styles.description}>
          {description}
        </Text>
      </View>
      <View style={styles.iconContainer}>
        <Icon name={icon} />
      </View>
    </TouchableOpacity>
  );
};
