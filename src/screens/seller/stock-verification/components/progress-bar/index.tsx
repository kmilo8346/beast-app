import React, { ReactNodeArray } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

// styles
import colors from '../../../../../styles/colors';

export interface ProgressBarProps {
  progress: number;
  goal: number;
  style?: StyleProp<ViewStyle>;
}

export default ({ progress, goal, style }: ProgressBarProps) => {
  // render logic
  const content: ReactNodeArray = [];

  for (let i = 0; i < goal; i++) {
    const barStyle: StyleProp<ViewStyle> = {
      flex: 1,
      height: 3,
      backgroundColor: colors.white,
    };
    if (i < progress) {
      barStyle.backgroundColor = colors.blue;
    }
    content.push(<View key={`${i}`} style={barStyle} />);
  }
  return (
    <View style={[{ flex: 1, flexDirection: 'row' }, style]}>{content}</View>
  );
};
