import React from 'react';
import { Text, StyleSheet } from 'react-native';

const SimpleText = (props) => {
  const { text, textStyles } = props;
  return <Text style={(styles.defaultStyle, { ...textStyles })}>{text}</Text>;
};

const styles = StyleSheet.create({
  defaultStyle: {
    width: 500,
    fontFamily: 'ProximaNova',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: '#171716',
  },
});

export default SimpleText;
