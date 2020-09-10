import React, { useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
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
  onFail?: () => void;
}

/**
 * @site https://github.com/expo/expo/issues/8185
 * @site https://github.com/firebase/FirebaseUI-Android/issues/1180
 */
export default ({
  onOK = () => null,
  onFail = () => null,
}: ButtonGoogleProps) => {
  // state
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    {
      expoClientId: Constants.manifest.extra.GOOGLE_AUTH_EXPO_CLIENT_ID,
      iosClientId: Constants.manifest.extra.GOOGLE_AUTH_IOS_CLIENT_ID,
      androidClientId: Constants.manifest.extra.GOOGLE_AUTH_ANDROID_CLIENT_ID,
    },
    {
      native: 'beast.app:/oauthredirect',
      useProxy: Platform.select({
        web: false,
        // Use the proxy in the Expo client.
        default:
          !!Constants.manifest && Constants?.appOwnership !== 'standalone',
      }),
    }
  );

  // event handlers
  const responseHandler = (response: any) => {
    switch (response.type) {
      case 'success':
        onOK(
          firebase.auth.GoogleAuthProvider.credential(response.params.id_token)
        );
        break;
      case 'error':
        onFail();
        break;
      default:
        console.warn(
          `${prefix} Response type not mapped, type: ${response.type}`
        );
        break;
    }
  };

  const pressButtonHandler = () => {
    promptAsync();
  };

  useEffect(() => {
    if (response) {
      responseHandler(response);
    }
  }, [response]);

  // render logic
  const titleComponent: ReactNode = (
    <Text level={5} weight="normal" color={colors.blackLight1}>
      Ingresar con Google
    </Text>
  );
  return (
    <Button
      title={titleComponent}
      icon={<GoogleIcon />}
      disabled={!request}
      onPress={pressButtonHandler}
      style={{
        backgroundColor: colors.blackLight7,
        borderWidth: 0,
      }}
    />
  );
};
