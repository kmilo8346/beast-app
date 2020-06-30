import React, { forwardRef } from 'react';
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
  prefix?: string | JSX.Element;
  suffix?: string;
  format?: (text: string | undefined) => string | undefined;
  parse?: (text: string) => string;
  containerStyle?: StyleProp<ViewStyle>;
  prefixStyle?: StyleProp<ViewStyle>;
  prefixComponentStyle?: StyleProp<ViewStyle>;
}

type Ref = TextInput;

export default forwardRef<Ref, InputProps>(
  (
    {
      label = '',
      value,
      errors = [],
      prefix = '',
      suffix = '',
      format = (text: string | undefined) => text,
      parse = (text: string) => text,
      onChangeText = () => null,
      containerStyle = {},
      prefixStyle = {},
      prefixComponentStyle = {},
      ...inputProps
    },
    ref
  ) => {
    // event handlers
    const changeTextHandler = (text: string) => {
      const parsedText = parse(text);
      onChangeText(parsedText);
    };

    // render logic
    const formmattedValue = format(value);
    const error = Array.isArray(errors) && errors.length ? errors[0] : null;
    const finalContainerStyle: StyleProp<ViewStyle> = [
      styles.container,
      containerStyle,
    ];
    const finalStyle: StyleProp<TextStyle> = [styles.input];
    let prefixComponent = null;
    let suffixComponent = null;
    if (prefix) {
      if (typeof prefix === 'string') {
        prefixComponent = (
          <View style={[styles.prefix, prefixStyle]}>
            <Icon name={prefix} />
          </View>
        );
      } else {
        prefixComponent = (
          <View style={[styles.prefix, prefixStyle]}>
            <View style={[styles.prefixComponent, prefixComponentStyle]}>
              {prefix}
            </View>
          </View>
        );
      }
      finalStyle.push({ paddingLeft: 45 });
    }
    if (suffix) {
      suffixComponent = (
        <View style={styles.suffix}>
          <Icon name={suffix} />
        </View>
      );
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
            ref={ref}
            placeholderTextColor={colors.blackLight4}
            value={formmattedValue}
            onChangeText={changeTextHandler}
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
  }
);
