import React from 'react';

import Input, { InputProps } from '../input';

// instaces outside component
const defaultFormat = (value?: number) =>
  typeof value === 'undefined' ? undefined : `${value}`;
const defaultParse = (value: string) => {
  if (!value) {
    return 0;
  }
  return parseInt(value, 10);
};

export interface InputNumericProps extends Omit<InputProps, 'value'> {
  value?: number;
  formatNumber?: (value?: number) => string | undefined;
  parseNumber?: (value: string) => number;
  onChangeValue?: (value: number) => void;
}

export default ({
  value,
  formatNumber = defaultFormat,
  parseNumber = defaultParse,
  onChangeValue = () => null,
  ...otherProps
}: InputNumericProps) => {
  // event handlers
  const changeTextHandler = (text: string) => {
    onChangeValue(parseNumber(text));
  };
  // render logic
  const formmattedValue = formatNumber(value);
  return (
    <Input
      {...otherProps}
      value={formmattedValue}
      onChangeText={changeTextHandler}
    />
  );
};
