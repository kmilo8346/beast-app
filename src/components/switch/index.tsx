import React from 'react';
import { Switch, SwitchProps as RNSwitchProps } from 'react-native';

// styles
import colors from '../../styles/colors';

export interface SwitchProps extends RNSwitchProps {
  defaultValue?: boolean;
}

export default (props: SwitchProps) => {
  // adapting props
  const { value, defaultValue } = props;
  let v = value;
  if (typeof value === 'undefined') {
    v = defaultValue;
  }
  // render logic
  return (
    <Switch
      {...props}
      value={v}
      thumbColor={colors.white}
      trackColor={{
        false: colors.blackLight5,
        true: colors.blue,
      }}
    />
  );
};
