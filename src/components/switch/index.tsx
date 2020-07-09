import React, { useState } from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';

import styles from './styles';

export interface SwitchProps {
  checked?: boolean;
  onChange: (value: boolean) => void;
}

export default ({ checked = false, onChange }: SwitchProps) => {
  const [check, setCheck] = useState(checked);
  const onChangeHandler = () => {
    setCheck((check) => !check);
    onChange(!check);
  };
  const containerStyle = [styles.container];
  if (check) {
    containerStyle.push(styles.checked);
  }
  return (
    <TouchableWithoutFeedback onPress={onChangeHandler}>
      <View style={containerStyle}>
        <View style={styles.pointerActive} />
      </View>
    </TouchableWithoutFeedback>
  );
};
