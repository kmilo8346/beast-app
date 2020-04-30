import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

const Button = (props) => {
  const {
    title,
    onPress,
    isEnabled = false,
    type = 'normal',
    positionStyles,
  } = props;
  return (
    <View style={[styles.container, { ...positionStyles }]}>
      <TouchableOpacity
        style={[
          styles.button,
          !isEnabled ? styles.disabled : {},
          type !== 'normal' ? styles.buttonFull : {},
        ]}
        onPress={onPress}
        disabled={!isEnabled}
      >
        <Text style={[styles.text, !isEnabled ? styles.textDisabled : {}]}>
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 500,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(255, 162, 61)',
    padding: 10,
    width: 327,
    height: 56,
    borderRadius: 28,
    marginBottom: 25,
  },
  buttonFull: {
    width: '100%',
  },
  disabled: {
    backgroundColor: 'rgba(229, 229, 229, 1)',
  },
  text: {
    height: 22,
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: '#ffffff',
  },
  textDisabled: {
    color: 'grey',
  },
});

export default Button;
