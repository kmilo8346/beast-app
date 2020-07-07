import React, { memo } from 'react';
import { GestureResponderEvent, View } from 'react-native';

// components
import Touchable from '../../touchable';
import Text from '../../text';
import Icon from '../../icon';
// styles
import styles from './styles';
import colors from '../../../styles/colors';

export interface InputSelectProps {
  label?: string;
  value: string;
  icon?: string;
  errors?: string[];
  onPress?: (event: GestureResponderEvent) => void;
}

export default memo(
  ({ label, value, icon, errors, onPress = () => null }: InputSelectProps) => {
    // render logic
    let iconComponent = null;
    if (icon) {
      iconComponent = <Icon name={icon} size={20} style={styles.icon} />;
    }
    let labelComponent = null;
    if (label) {
      labelComponent = (
        <Text
          level={6}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.label}
        >
          {label}
        </Text>
      );
      if (!value) {
        labelComponent = (
          <Text level={5} numberOfLines={1} ellipsizeMode="tail">
            {label}
          </Text>
        );
      }
    }
    let valueComponent = null;
    if (value) {
      valueComponent = (
        <Text level={5} numberOfLines={1} ellipsizeMode="tail">
          {value}
        </Text>
      );
    }
    const error = Array.isArray(errors) && errors.length ? errors[0] : null;
    return (
      <View>
        <Touchable onPress={onPress}>
          <View style={styles.container}>
            {iconComponent}
            <View style={styles.textContainer}>
              {labelComponent}
              {valueComponent}
            </View>
            <Icon name="chevron-down" />
          </View>
        </Touchable>
        <Text level={8} color={colors.red} style={styles.error}>
          {error || ' '}
        </Text>
      </View>
    );
  }
);
