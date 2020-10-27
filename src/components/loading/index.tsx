import React, { useState, useEffect } from 'react';
import { View, Animated, Platform, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';
import colors from '../../styles/colors';

// assets
const Loading = require('../../../assets/lotties/carga.json');

// instances outside components
const client_messages = [
  'Despachos por siempre gratis',
  'Las tiendas están muy cercas de ti',
  'Descubre lo que vende tu vecino',
];
const seller_messages = [
  'No tienes que ser empresa para vender',
  'Genera confianza con tus clientes',
];

export enum MessageTypes {
  CLIENT = 'client',
  SELLER = 'seller',
}

interface ComponentProps {
  message_type?: MessageTypes;
}

export default ({ message_type = MessageTypes.CLIENT }: ComponentProps) => {
  // state
  const [currentMessage, setCurrentMessage] = useState(0);
  const animated = new Animated.Value(0);
  const translateX = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [350, 0],
  });
  const transform = [{ translateX }];

  // event handlers
  const resetMessage = () => {
    slideIn();
    if (currentMessage === messages.length - 1) {
      setCurrentMessage(0);
      return;
    }
    setCurrentMessage((currentMessage) => currentMessage + 1);
  };

  const slideIn = () => {
    Animated.timing(animated, {
      useNativeDriver: true,
      toValue: 1,
      duration: 1400,
    }).start();
  };

  useEffect(() => {
    const intervalId = setInterval(resetMessage, 3500);
    slideIn();

    return () => {
      // clear interval
      clearInterval(intervalId);
    };
  });

  // render logic
  const messages =
    message_type === MessageTypes.CLIENT ? client_messages : seller_messages;
  return (
    <View
      style={{
        alignItems: 'center',
      }}
    >
      {Platform.OS === 'android' ? (
        <ActivityIndicator size="large" color={colors.blue} />
      ) : (
        <LottieView
          style={{
            height: 300,
            marginBottom: -50,
          }}
          autoPlay
          source={Loading}
        />
      )}

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
