import React from 'react';
import { View } from 'react-native';

// styles
import colors from '../../styles/colors';

interface ComponentProps {
  type?: 'thin' | 'thick';
}

export default ({ type = 'thin' }: ComponentProps) => {
  // computed
  let height = 1;
  if (type === 'thick') {
    height = 10;
  }

  // render logic
  return (
    <View
      style={{ width: '100%', height, backgroundColor: colors.blackLight8 }}
    />
  );
};
