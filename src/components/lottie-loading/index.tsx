import React, { useState, useEffect } from 'react';
import { View, Animated } from 'react-native';
import LottieView from 'lottie-react-native';

// assets
import Loading from '../../../assets/lotties/carga.json';

const messages = [
  'Conectando reflectores.',
  'Enviando la señal.',
  'Despertando a Batman.',
  'Poniendole bencina al batimovil.',
  'Llamando a Robin.',
];

export default () => {
  // state
  const [currentMessage, setCurrentMessage] = useState(0);
  // message logic
  const resetMessage = () => {
    if (currentMessage === messages.length - 1) {
      setCurrentMessage(0);
      return;
    }
    setCurrentMessage((currentMessage) => currentMessage + 1);
  };
  const changeMessage = setInterval(resetMessage, 3500);

  // animation logic
  const animated = new Animated.Value(0);
  const slideIn = () => {
    Animated.timing(animated, {
      useNativeDriver: true,
      toValue: 1,
      duration: 1400,
    }).start();
  };
  const translateX = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [350, 0],
  });
  const transform = [{ translateX }];
  // event handlers
  useEffect(() => {
    slideIn();
    return () => {
      // clear interval
      clearInterval(changeMessage);
    };
  });

  return (
    <View
      style={{
        alignItems: 'center',
      }}
    >
      <LottieView
        style={{
          height: 300,
          marginBottom: -50,
        }}
        autoPlay
        source={Loading}
      />
      <Animated.Text
        style={[
          {
            width: '100%',
            textAlign: 'center',
          },
          { transform },
        ]}
      >
        {messages[currentMessage]}
      </Animated.Text>
    </View>
  );
};
