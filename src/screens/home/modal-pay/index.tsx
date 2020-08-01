import React, { useState, ReactNode } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// components
import { Modal, Text } from '../../../components';

export interface CartModalProps {
  onRequestClose?: () => void;
}

export default ({ onRequestClose = () => null }: CartModalProps) => {
  const [state, setState] = useState({
    view: 'WEBVIEW',
  });
  // render logic
  let content: ReactNode | null = null;
  switch (state.view) {
    case 'WEBVIEW':
      content = (
        <WebView
          source={{
            uri:
              'https://www.mercadopago.cl/checkout/v1/redirect?pref_id=600378423-1b296a1d-52eb-4b17-b951-88b768de739d',
          }}
          automaticallyAdjustContentInsets={false}
          javaScriptEnabled
          domStorageEnabled
          decelerationRate="normal"
          startInLoadingState
          scalesPageToFit
          style={{ flex: 1 }}
          onNavigationStateChange={(newNavState) => {
            console.log(newNavState);
            if (newNavState.url.startsWith('https://www.tu-sitio/success')) {
              setState({
                view: 'SUCCESS',
              });
            } else if (
              newNavState.url.startsWith('https://www.tu-sitio/failure')
            ) {
              setState({
                view: 'FAILURE',
              });
            } else if (
              newNavState.url.startsWith('https://www.tu-sitio/pending')
            ) {
              setState({
                view: 'PENDING',
              });
            }
            // newNavState looks something like this:
            // {
            //   url?: string;
            //   title?: string;
            //   loading?: boolean;
            //   canGoBack?: boolean;
            //   canGoForward?: boolean;
            // }
            // const { url } = newNavState;
            // if (!url) return;

            // // one way to handle a successful form submit is via query strings
            // if (url.includes('?message=success')) {
            //   this.webview.stopLoading();
            //   // maybe close this view?
            // }

            // // one way to handle errors is via query string
            // if (url.includes('?errors=true')) {
            //   this.webview.stopLoading();
            // }
          }}
        />
      );
      break;
    case 'SUCCESS':
      content = (
        <View style={{ flex: 1 }}>
          <Text>SUCCESS</Text>
        </View>
      );
      break;
    case 'FAILURE':
      content = (
        <View style={{ flex: 1 }}>
          <Text>FAILURE</Text>
        </View>
      );
      break;
    case 'PENDING':
      content = (
        <View style={{ flex: 1 }}>
          <Text>PENDING</Text>
        </View>
      );
      break;

    default:
      break;
  }
  return (
    <Modal title="Pasarela de pago" type="full" onRequestClose={onRequestClose}>
      {content}
    </Modal>
  );
};
