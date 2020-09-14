import React, { ReactNode } from 'react';
import * as Google from 'expo-google-app-auth';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

// components
import Button from '../../../../components/buttons/button';
import Text from '../../../../components/text';
import GoogleIcon from '../../../../components/svgs/icons/google';
// libs
import firebase from '../../../../lib/firebase';
// styles
import colors from '../../../../styles/colors';

// instances outside component
const prefix = '[button google component]';
WebBrowser.maybeCompleteAuthSession();

export interface ButtonGoogleProps {
  onOK?: (credential: firebase.auth.OAuthCredential) => void;
}

/**
 * @site https://github.com/expo/expo/issues/8185
 * @site https://github.com/firebase/FirebaseUI-Android/issues/1180
 */
export default ({ onOK = () => null }: ButtonGoogleProps) => {
  // expoClientId: Constants.manifest.extra.GOOGLE_AUTH_EXPO_CLIENT_ID,
  // iosClientId: Constants.manifest.extra.GOOGLE_AUTH_IOS_CLIENT_ID,
  // androidClientId: Constants.manifest.extra.GOOGLE_AUTH_ANDROID_CLIENT_ID,

  // event handlers
  const login = async () => {
    try {
      const result = await Google.logInAsync({
        androidClientId:
          Constants.manifest.extra.GOOGLE_AUTH_ANDROID_DEVELOPMENT_CLIENT_ID,
        iosClientId:
          Constants.manifest.extra.GOOGLE_AUTH_IOS_DEVELOPMENT_CLIENT_ID,
        androidStandaloneAppClientId:
          Constants.manifest.extra.GOOGLE_AUTH_ANDROID_CLIENT_ID,
        iosStandaloneAppClientId:
          Constants.manifest.extra.GOOGLE_AUTH_IOS_CLIENT_ID,
        scopes: ['profile', 'email'],
      });

      if (result.type === 'success') {
        onOK(firebase.auth.GoogleAuthProvider.credential(result.idToken));
      }
    } catch (error) {
      // TODO: manage error
      console.log(`${prefix}`, error);
    }
  };

  const pressHandler = () => {
    login();
  };

  // render logic
  const titleComponent: ReactNode = (
    <Text level={5} weight="normal" color={colors.blackLight1}>
      Ingresar con Google v2
    </Text>
  );
  return (
    <Button
      title={titleComponent}
      icon={<GoogleIcon />}
      onPress={pressHandler}
      style={{
        backgroundColor: colors.blackLight7,
        borderWidth: 0,
      }}
    />
  );
};
