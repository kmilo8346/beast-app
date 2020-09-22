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
  labelStyles?: TextStyle;
  errors?: string[];
  lengthCounter?: boolean;
  prefix?: string | JSX.Element;
  suffix?: string | JSX.Element;
  format?: (text: string | undefined) => string | undefined;
  parse?: (text: string) => string;
  containerStyle?: StyleProp<ViewStyle>;
  prefixStyle?: StyleProp<ViewStyle>;
  suffixStyle?: StyleProp<ViewStyle>;
}

type Ref = TextInput;

export default forwardRef<Ref, InputProps>(
  (
    {
      label = '',
      labelStyles = {},
      value,
      errors = [],
      lengthCounter = false,
      prefix = '',
      suffix = '',
      format = (text: string | undefined) => text,
      parse = (text: string) => text,
      onChangeText = () => null,
      containerStyle = {},
      prefixStyle = {},
      suffixStyle = {},
      clearButtonMode = 'while-editing',
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
    let prefixContainer = null;
    let suffixContainer = null;
    let lentghCounterComponent = null;
    if (prefix) {
      let prefixComponent = null;
      if (typeof prefix === 'string') {
        prefixComponent = <Icon name={prefix} />;
      } else {
        prefixComponent = prefix;
      }
      prefixContainer = (
        <View style={[styles.prefix, prefixStyle]}>{prefixComponent}</View>
      );
      finalStyle.push({ paddingLeft: 45 });
    }
    if (suffix) {
      let suffixComponent = null;
      if (typeof suffix === 'string') {
        suffixComponent = <Icon name={suffix} />;
      } else {
        suffixComponent = suffix;
      }
      suffixContainer = (
        <View style={[styles.suffix, suffixStyle]}>{suffixComponent}</View>
      );
      finalStyle.push({ paddingRight: 45 });
    }
    if (lengthCounter) {
      if (!inputProps.maxLength) {
        console.warn('Length counter without max length dont have any sense');
      }
      let right = 0;
      if (!inputProps.multiline && value) {
        right = 25;
      }
      lentghCounterComponent = (
        <View
          style={{
            position: 'absolute',
            right,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text level={6} color={colors.blackLight3}>
            {`${(value || '').length}/${inputProps.maxLength}`}
          </Text>
        </View>
      );
      finalStyle.push({ paddingRight: 50 });
    }
    finalStyle.push(inputProps.style);
    return (
      <View style={finalContainerStyle}>
        {!!label && (
          <Text level={6} style={[styles.label, labelStyles]}>
            {label}
          </Text>
        )}
        <View style={styles.inputWrapper}>
          {prefixContainer}
          <TextInput
            {...inputProps}
            ref={ref}
            placeholderTextColor={colors.blackLight4}
            value={formmattedValue}
            onChangeText={changeTextHandler}
            style={finalStyle}
            clearButtonMode={clearButtonMode}
          />
          {lentghCounterComponent}
          {suffixContainer}
        </View>

        <Text level={8} color={colors.red} style={styles.error}>
          {error || ' '}
        </Text>
      </View>
    );
  }
);
