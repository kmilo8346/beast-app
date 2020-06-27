import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {
  makeRedirectUri,
  useAuthRequest,
  useAutoDiscovery,
  ResponseType,
  AuthSessionResult,
} from 'expo-auth-session';

// components
import Button from '../../../../components/buttons/button';
// libs
import firebase from '../../../../lib/firebase';

// instances outside component
WebBrowser.maybeCompleteAuthSession();
const useProxy = Platform.select({ web: false, default: true });

export interface ButtonGoogleProps {
  onOK?: (credential: firebase.auth.OAuthCredential) => void;
  onFail?: () => void;
}

/**
 * @site https://github.com/expo/expo/issues/8185
 */
export default ({
  onOK = () => null,
  onFail = () => null,
}: ButtonGoogleProps) => {
  // state
  const discovery = useAutoDiscovery('https://accounts.google.com');
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId:
        '7074171791-5e7cc1p910hise0666go5gncohunps8g.apps.googleusercontent.com',
      redirectUri: makeRedirectUri({
        // For usage in bare and standalone
        native:
          'com.googleusercontent.apps.7074171791-5e7cc1p910hise0666go5gncohunps8g://redirect',
        useProxy,
      }),
      scopes: ['openid', 'profile', 'email'],
      usePKCE: false,
    },
    discovery
  );

  // event handlers
  const responseHandler = (response: AuthSessionResult) => {
    switch (response.type) {
      case 'success':
        onOK(
          firebase.auth.GoogleAuthProvider.credential(
            null, // Pass the access_token as the second property
            response.params.access_token
          )
        );
        break;
      case 'error':
        onFail();
        break;
      default:
        // ignore other cases
        break;
    }
  };
  const pressButtonHandler = () => {
    promptAsync({ useProxy });
  };
  useEffect(() => {
    if (response) {
      responseHandler(response);
    }
  }, [response]);

  // render logic
  return (
    <Button
      title="Entrar con Google"
      disabled={!request}
      onPress={pressButtonHandler}
    />
  );
};
