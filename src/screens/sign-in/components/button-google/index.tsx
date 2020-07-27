import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {
  makeRedirectUri,
  useAuthRequest,
  useAutoDiscovery,
  ResponseType,
  AuthSessionResult,
  generateHexStringAsync,
  Prompt,
} from 'expo-auth-session';
import Constants from 'expo-constants';

// components
import Button from '../../../../components/buttons/button';
// libs
import firebase from '../../../../lib/firebase';

// instances outside component
WebBrowser.maybeCompleteAuthSession();
const useProxy = Platform.select({ web: false, default: true });
function useNonce() {
  const [nonce, setNonce] = React.useState<string | null>(null);
  React.useEffect(() => {
    generateHexStringAsync(16).then((value) => setNonce(value));
  }, []);
  return nonce;
}

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
  const nonce = useNonce();
  const discovery = useAutoDiscovery('https://accounts.google.com');
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.IdToken,
      clientId: Constants.manifest.extra.GOOGLE_AUTH_CLIENT_ID,
      redirectUri: makeRedirectUri({
        // For usage in bare and standalone
        native: Constants.manifest.extra.GOOGLE_AUTH_NATIVE_REDIRECT,
        useProxy,
      }),
      scopes: ['profile', 'email'],
      extraParams: {
        nonce: nonce as string,
      },
      usePKCE: false,
      prompt: Prompt.SelectAccount,
    },
    discovery
  );

  // event handlers
  const responseHandler = (response: AuthSessionResult) => {
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
      type="secondary"
      disabled={!request || !nonce}
      onPress={pressButtonHandler}
    />
  );
};
