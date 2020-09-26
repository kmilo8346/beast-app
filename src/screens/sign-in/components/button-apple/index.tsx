import React, { useEffect, useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// libs
import firebase from '../../../../lib/firebase';
import { capture } from '../../../../lib/sentry';
// styles
import colors from '../../../../styles/colors';

// instances outside component
const prefix = '[button apple component]';

export interface ButtonAppleProps {
  onOK?: (info: {
    credential: firebase.auth.OAuthCredential;
    appleCredential: AppleAuthentication.AppleAuthenticationCredential;
  }) => void;
}

export default ({ onOK = () => null }: ButtonAppleProps) => {
  const [loginAvailable, setLoginAvailable] = useState(false);
  const [processing, setProcessing] = useState(false);

  // event handlers
  const checkLoginAvailable = async () => {
    try {
      const loginAvailable = await AppleAuthentication.isAvailableAsync();
      setLoginAvailable(loginAvailable);
    } catch (error) {
      capture(prefix, 'Check login available error', error);
    }
  };

  const login = async () => {
    try {
      if (processing) {
        return;
      }
      setProcessing(true);
      const csrf = Math.random().toString(36).substring(2, 15);
      const nonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );
      let appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        state: csrf,
        nonce: hashedNonce,
      });

      if (appleCredential.email && appleCredential.fullName?.givenName) {
        try {
          await SecureStore.setItemAsync(
            appleCredential.user,
            JSON.stringify({
              email: appleCredential.email,
              fullName: appleCredential.fullName,
            })
          );
        } catch (error) {
          capture(
            prefix,
            'Saving apple credentials in secure store error',
            error
          );
        }
      } else {
        try {
          const info = await SecureStore.getItemAsync(appleCredential.user);
          if (!info) {
            throw new Error(
              `Apple credentials not found in secure store, user: ${appleCredential.user}`
            );
          }
          appleCredential = {
            ...appleCredential,
            ...JSON.parse(info),
          };
        } catch (error) {
          capture(
            prefix,
            'Getting apple credentials from secure store error',
            error
          );
        }
      }

      const { identityToken } = appleCredential;
      if (identityToken) {
        const provider = new firebase.auth.OAuthProvider('apple.com');
        const credential = provider.credential({
          idToken: identityToken,
          rawNonce: nonce, // nonce value from above
        });
        setImmediate(() => {
          onOK({
            credential,
            appleCredential,
          });
        });
      } else {
        console.warn(
          `${prefix}: Indentity token not defined in a sucesfull login`
        );
      }
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        console.log(`${prefix}: The user canceled the sign-in flow`);
      } else {
        capture(prefix, 'Login error', error);
      }
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    checkLoginAvailable();
  }, []);

  // render logic
  if (!loginAvailable) {
    return null;
  }

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      style={{ width: '100%', height: 49 }}
      onPress={login}
    />
  );
};
