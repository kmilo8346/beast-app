import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

// components
import Text from '../../../../../components/text';
import Icon from '../../../../../components/icon';
// screen components
import FullModal, { FullModalProps } from '../../../../components/full-modal';
// libs
import * as utils from '../../../../../lib/utils';
import Sentry, { capture } from '../../../../../lib/sentry';
// styles
import colors from '../../../../../styles/colors';

// instances outside component
const prefix = '[link account modal]';
let redirected = false;

interface ComponentProps extends Omit<FullModalProps, 'children'> {
  onRedirectOk?: (code: string) => void;
  onRedirectFail?: () => void;
}

export default ({
  onRedirectOk = utils.noop,
  onRedirectFail = utils.noop,
  ...otherProps
}: ComponentProps) => {
  // state
  const webViewRef = useRef<WebView>(null);

  // event handler
  const navigationStateChangeHandler = (event: WebViewNavigation) => {
    const { url } = event;
    if (redirected || !url) {
      return;
    }

    if (
      url.startsWith(Constants.manifest.extra.MERCADO_PAGO_AUTH_REDIRECT_URI)
    ) {
      redirected = true;
      webViewRef.current?.stopLoading();
      const parsed = Linking.parse(url);
      if (parsed.queryParams?.code) {
        onRedirectOk(parsed.queryParams?.code);
      } else {
        capture(
          prefix,
          'Redirecting error',
          undefined,
          (scope: Sentry.Scope) => {
            scope.setExtra('url', url);
            scope.setExtra('query_params', parsed.queryParams);
          }
        );

        onRedirectFail();
      }
    }
  };

  useEffect(() => {
    redirected = false;
  }, []);

  // render logic
  return (
    <FullModal {...otherProps}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Icon name="lock" size={18} />
        <Text level={6} style={{ marginLeft: 5 }}>
          mercadopago.cl
        </Text>
      </View>
      <WebView
        incognito
        source={{
          uri: `${Constants.manifest.extra.MERCADO_PAGO_AUTH_URL}?client_id=${Constants.manifest.extra.MERCADO_PAGO_AUTH_CLIENT_ID}&response_type=code&platform_id=mp&redirect_uri=${Constants.manifest.extra.MERCADO_PAGO_AUTH_REDIRECT_URI}`,
        }}
        startInLoadingState
        ref={webViewRef}
        renderLoading={() => (
          <ActivityIndicator size="small" color={colors.black} />
        )}
        style={{ flex: 1 }}
        onNavigationStateChange={navigationStateChangeHandler}
      />
    </FullModal>
  );
};
