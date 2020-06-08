import React from 'react';

import { ViewStyle, StyleProp, View } from 'react-native';
import ButtonSmall from '../button-small';
import InputNumber from '../input-number';

export interface FriendlyInputNumberProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  style?: StyleProp<ViewStyle>;
}

export default ({
  value,
  max = Number.MAX_SAFE_INTEGER,
  onChange = () => null,
  style = {},
}: FriendlyInputNumberProps) => {
  const containerStyle = [style];
  let content = (
    <ButtonSmall
      title="Agregar"
      onPress={() => {
        onChange(1);
      }}
    />
  );
  if (value > 0) {
    content = (
      <InputNumber value={value} min={0} max={max} onChange={onChange} />
    );
  }

  return <View style={containerStyle}>{content}</View>;
};
