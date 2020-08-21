import React, { useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {
  makeRedirectUri,
  ResponseType,
  useAuthRequest,
  AuthSessionResult,
  Prompt,
} from 'expo-auth-session';
import Constants from 'expo-constants';

// components
import Button from '../../../../components/buttons/button';
import Text from '../../../../components/text';
import Facebook from '../../../../components/svgs/icons/facebook';
// libs
import firebase from '../../../../lib/firebase';
import colors from '../../../../styles/colors';

// instances outside component
WebBrowser.maybeCompleteAuthSession();
const discovery = {
  authorizationEndpoint: 'https://www.facebook.com/v6.0/dialog/oauth',
  tokenEndpoint: 'https://graph.facebook.com/v6.0/oauth/access_token',
};
const useProxy = Platform.select({ web: false, default: true });

export interface ButtonFacebookProps {
  onOK?: (credential: firebase.auth.OAuthCredential) => void;
  onFail?: () => void;
}

export default ({
  onOK = () => null,
  onFail = () => null,
}: ButtonFacebookProps) => {
  // state
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: Constants.manifest.extra.FACEBOOK_AUTH_CLIENT_ID,
      scopes: ['public_profile', 'email', 'user_likes'],
      // For usage in managed apps using the proxy
      redirectUri: makeRedirectUri({
        useProxy,
        // For usage in bare and standalone
        // Use your FBID here. The path MUST be `authorize`.
        native: Constants.manifest.extra.FACEBOOK_AUTH_NATIVE_REDIRECT,
      }),
      extraParams: {
        // Use `popup` on web for a better experience
        display: Platform.select({ web: 'popup' }) as string,
        // Optionally you can use this to rerequest declined permissions
        auth_type: 'rerequest',
      },
      prompt: Prompt.SelectAccount,
    },
    discovery
  );

  // event handlers
  const responseHandler = async (response: AuthSessionResult) => {
    switch (response.type) {
      case 'success':
        onOK(
          firebase.auth.FacebookAuthProvider.credential(
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
  const pressHandler = () => {
    promptAsync({
      useProxy,
    });
  };
  useEffect(() => {
    if (response) {
      responseHandler(response);
    }
  }, [response]);

  // render logic
  const titleComponent: ReactNode = (
    <Text level={5} weight="normal" color={colors.blackLight1}>
      Ingresar con Facebook
    </Text>
  );
  return (
    <Button
      title={titleComponent}
      icon={<Facebook />}
      disabled={!request}
      onPress={pressHandler}
      style={{
        backgroundColor: colors.blackLight7,
        borderWidth: 0,
      }}
    />
  );
};
