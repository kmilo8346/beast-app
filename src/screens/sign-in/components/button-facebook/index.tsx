import React, { ReactNode } from 'react';
import Constants from 'expo-constants';
import * as Facebook from 'expo-facebook';

// components
import Button from '../../../../components/buttons/button';
import Text from '../../../../components/text';
import FacebookIcon from '../../../../components/svgs/icons/facebook';
// libs
import firebase from '../../../../lib/firebase';
import colors from '../../../../styles/colors';
import { capture } from '../../../../lib/sentry';

// instances outside component
const prefix = '[button facebook component]';

export interface ButtonFacebookProps {
  onOK?: (credential: firebase.auth.OAuthCredential) => void;
}

/**
 * Facebook login dont work in ios expo client (emulator and device)
 * https://github.com/firebase/FirebaseUI-iOS/issues/566
 * https://github.com/expo/expo/issues/8226
 *
 * To test in expo client (device)
 * Is necesary build a custom expo client with firedevs credentials
 * https://docs.expo.io/guides/adhoc-builds/
 *
 */
export default ({ onOK = () => null }: ButtonFacebookProps) => {
  // event handlers
  const login = async () => {
    try {
      await Facebook.initializeAsync(
        Constants.manifest.extra.FACEBOOK_AUTH_CLIENT_ID
      );
      const result = await Facebook.logInWithReadPermissionsAsync();
      if (result.type === 'success') {
        onOK(firebase.auth.FacebookAuthProvider.credential(result.token));
      }
    } catch (error) {
      capture(prefix, 'Login error', error);
    }
  };

  const pressHandler = () => {
    login();
  };

  // render logic
  const titleComponent: ReactNode = (
    <Text level={5} weight="normal" color={colors.blackLight1}>
      Ingresar con Facebook
    </Text>
  );
  return (
    <Button
      title={titleComponent}
      icon={<FacebookIcon />}
      onPress={pressHandler}
      style={{
        backgroundColor: colors.blackLight7,
        borderWidth: 0,
      }}
    />
  );
};
