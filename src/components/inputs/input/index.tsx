import React, { useRef } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';

// components
import Text from '../../text';
import Icon from '../../icon';
// styles
import colors from '../../../styles/colors';
import styles from './styles';

export interface InputProps extends TextInputProps {
  label?: string;
  errors?: string[];
  prefix?: string;
  suffix?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export default ({
  label = '',
  errors = [],
  prefix = '',
  suffix = '',
  containerStyle = {},
  ...inputProps
}: InputProps) => {
  const error = Array.isArray(errors) && errors.length ? errors[0] : null;
  const input = useRef<TextInput>(null);

  const finalContainerStyle: StyleProp<ViewStyle> = [
    styles.container,
    containerStyle,
  ];
  const finalStyle: StyleProp<TextStyle> = [styles.input];
  let prefixComponent = null;
  let suffixComponent = null;
  if (prefix) {
    prefixComponent = <Icon name={prefix} style={styles.prefix} />;
    finalStyle.push({ paddingLeft: 35 });
  }
  if (suffix) {
    suffixComponent = <Icon name={suffix} style={styles.suffix} />;
    finalStyle.push({ paddingRight: 35 });
  }
  finalStyle.push(inputProps.style);

  return (
    <View style={finalContainerStyle}>
      {!!label && (
        <Text level={6} style={styles.label}>
          {label}
        </Text>
      )}
      <View style={styles.inputWrapper}>
        {prefixComponent}
        <TextInput
          {...inputProps}
          ref={input}
          style={finalStyle}
          clearButtonMode="while-editing"
        />
        {suffixComponent}
      </View>

      <Text level={8} color={colors.red} style={styles.error}>
        {error || ' '}
      </Text>
    </View>
  );
};
