import React from 'react';
import { StyleProp, TextStyle, View } from 'react-native';

// components
import Text from '../../../../../../components/text';
// lib
import numberFormatter from '../../../../../../lib/formatters/number-formatter';
// styles
import colors from '../../../../../../styles/colors';

interface DayItemProps {
  day: string;
  relevantDay: number;
  open: number;
  close: number;
}
// instances outside component
const prefix = '[opening hours info modal day item]';

const formatDay = (day: string): string => {
  switch (day) {
    case '1':
      return 'Lunes';
    case '2':
      return 'Martes';
    case '3':
      return 'Miércoles';
    case '4':
      return 'Jueves';
    case '5':
      return 'Viernes';
    case '6':
      return 'Sábado';
    case '7':
      return 'Domingo';
    default:
      throw new Error(`${prefix} Invalid day ${day}`);
  }
};

const humanizeOpenRange = (open: number, close: number) => {
  if (open === 0 && close === 0) {
    return 'Cerrado';
  }
  return `${numberFormatter.humanizeTime(
    open
  )} - ${numberFormatter.humanizeTime(close)}`;
};

export default ({ day, relevantDay, open, close }: DayItemProps) => {
  const style: StyleProp<TextStyle> = { color: colors.blackLight3 };

  if (Number(day) - relevantDay === 0 || Number(day) - relevantDay === 7) {
    style.color = colors.black;
  }

  return (
    <View style={{ flexDirection: 'row', marginBottom: 15, paddingLeft: 5 }}>
      <Text
        level={5}
        style={[
          {
            flex: 1,
          },
          style,
        ]}
      >
        {formatDay(day)}
      </Text>
      <Text
        level={5}
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[
          {
            flex: 2,
          },
          style,
        ]}
      >
        {humanizeOpenRange(open, close)}
      </Text>
    </View>
  );
};
