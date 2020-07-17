import React from 'react';
import { Switch, SwitchProps } from 'react-native';

// styles
import colors from '../../styles/colors';

export default (props: SwitchProps) => {
  return (
    <Switch
      {...props}
      thumbColor={colors.white}
      trackColor={{
        false: colors.blackLight5,
        true: colors.blue,
      }}
    />
  );
};
