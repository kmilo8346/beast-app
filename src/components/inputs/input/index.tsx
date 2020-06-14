import React, { useRef } from 'react';
import { View, TextInput, TextInputProps } from 'react-native';

import Text from '../../text';
import colors from '../../../styles/colors';
import styles from './styles';

export interface InputProps extends TextInputProps {
  label?: string;
  errors?: string[];
}

export default ({ label = '', errors = [], ...inputProps }: InputProps) => {
  const error = Array.isArray(errors) && errors.length ? errors[0] : null;
  const input = useRef<TextInput>(null);

  return (
    <View style={styles.container}>
      {!!label && (
        <Text level={6} style={styles.label}>
          {label}
        </Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          ref={input}
          style={styles.input}
          {...inputProps}
          clearButtonMode="while-editing"
        />
      </View>

      <Text level={8} color={colors.red} style={styles.error}>
        {error || ' '}
      </Text>
    </View>
  );
};
