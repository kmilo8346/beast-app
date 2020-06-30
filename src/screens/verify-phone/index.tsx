import React, { useReducer, useRef } from 'react';
import { View, TextInput } from 'react-native';
import OTPInputView from '@twotalltotems/react-native-otp-input';

// components
import { Container, Text } from '../../components';
// containers
import UserProvider from '../../containers/user';
// styles
import styles from './styles';
import colors from '../../styles/colors';

export interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  const userContainer = UserProvider.useContainer();
  const user = userContainer.getUser();
  const { redirect } = route.params;

  // event handlers
  const submitHandler = async (code: string) => {
    try {
      // TODO: send code to backend
      console.log(`${code} was sent to backend`);
      await userContainer.updateUser({ phoneVerified: true });
      navigation.replace(redirect.name, redirect.params);
    } catch (error) {
      // TODO: log error and show toast
    }
  };

  return (
    <Container safeArea withMargin>
      <Text level={2} weight="bold" style={{ marginBottom: 10 }}>
        Ingresa el código
      </Text>
      <Text style={{ marginBottom: 60 }}>
        <Text level={5}>Te enviamos un código de verificación a tu número</Text>
        <Text level={5} weight="bold">
          {user?.phone}
        </Text>
      </Text>
      <OTPInputView
        style={{ height: 200, marginHorizontal: 20 }}
        pinCount={4}
        autoFocusOnLoad
        codeInputFieldStyle={{
          width: 60,
          height: 60,
          borderWidth: 1,
          borderColor: colors.blackLight5,
          borderRadius: 13,
          fontSize: 20,
          fontWeight: 'bold',
          color: colors.black,
        }}
        codeInputHighlightStyle={{
          borderColor: colors.blue,
        }}
        onCodeFilled={(code) => {
          submitHandler(code);
        }}
      />
    </Container>
  );
};
