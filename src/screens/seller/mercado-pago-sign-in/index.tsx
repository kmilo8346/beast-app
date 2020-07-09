import React, { useEffect, useReducer } from 'react';
import { View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { CommonActions } from '@react-navigation/native';

// components
import {
  Container,
  ErrorView,
  Loading,
  Text,
  Button,
} from '../../../components';
// clients
import mercadoPagoAuthSaveUrlClient from '../../../clients/mercado-pago/auth-safe-url-client';
// container
import UserProvider from '../../../containers/user';
// styles
import globalStyles from '../../../styles';

// instances
const prefix = '[mercado pago sign in]';

type ShowLoadingAction = {
  type: 'show_loading';
};
type ShowErrorAction = {
  type: 'show_error';
};
type ShowMercadoPagoSignInAction = {
  type: 'show_mercado_pago_sign_in';
  safeUrl: string;
};
type ShowReadyAction = {
  type: 'show_ready';
};
type Action =
  | ShowLoadingAction
  | ShowErrorAction
  | ShowMercadoPagoSignInAction
  | ShowReadyAction;
type State = {
  view: 'LOADING' | 'ERROR' | 'MERCADO_PAGO_SIGN_IN' | 'READY';
  safeUrl: string;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'show_loading':
      return { ...state, view: 'LOADING' };
    case 'show_error':
      return { ...state, view: 'ERROR' };
    case 'show_mercado_pago_sign_in':
      return {
        ...state,
        view: 'MERCADO_PAGO_SIGN_IN',
        safeUrl: action.safeUrl,
      };
    case 'show_ready':
      return { ...state, view: 'READY' };
    default:
      return state;
  }
};

export interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    view: 'LOADING',
    safeUrl: '',
  });
  const userContainer = UserProvider.useContainer();
  const user = userContainer.getUser();
  // precondition
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }

  // event handlers
  const fetchSaveUrl = async () => {
    try {
      if (user.mercadoPago?.userId) {
        return;
      }
      dispatch({ type: 'show_loading' });
      const { safeUrl } = await mercadoPagoAuthSaveUrlClient.create({
        body: {
          userId: user?.id,
        },
      });
      dispatch({ type: 'show_mercado_pago_sign_in', safeUrl });
    } catch (error) {
      // TODO: log error
      console.log(error);
      dispatch({ type: 'show_error' });
    }
  };
  const messageIncomingHandler = (event: WebViewMessageEvent) => {
    const messageFromWebView = JSON.parse(event.nativeEvent.data);
    if (messageFromWebView.status === 'ERROR') {
      // TODO: log error
      console.log(`${prefix} Error from webview ${messageFromWebView.message}`);
      dispatch({ type: 'show_error' });
    }
  };
  const retryHandler = () => {
    if (!state.safeUrl) {
      fetchSaveUrl();
    } else {
      dispatch({ type: 'show_mercado_pago_sign_in', safeUrl: state.safeUrl });
    }
  };
  const pressLetsStart = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: 'SellerDashboard' }],
      })
    );
  };
  useEffect(() => {
    fetchSaveUrl();
  }, []);
  useEffect(() => {
    if (user.mercadoPago?.userId) {
      dispatch({ type: 'show_ready' });
    }
  });
  // render logic
  let content = null;
  switch (state.view) {
    case 'ERROR':
      content = <ErrorView onRetry={retryHandler} />;
      break;
    case 'MERCADO_PAGO_SIGN_IN':
      content = (
        <WebView
          source={{ uri: state.safeUrl }}
          onMessage={messageIncomingHandler}
          style={{ flex: 1 }}
        />
      );
      break;
    case 'READY':
      content = (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text level={1} weight="bold" style={{ marginBottom: 15 }}>
            ¡Genial!
          </Text>
          <Text level={5}>Estamos listos para empezar a vender.</Text>
          <View
            style={[
              { position: 'absolute', left: 0, right: 0, bottom: 0 },
              globalStyles.withMargin,
            ]}
          >
            <Button
              title="Comencemos"
              onPress={pressLetsStart}
              style={globalStyles.withMainActionAir}
            />
          </View>
        </View>
      );
      break;
    default:
      content = (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Loading />
        </View>
      );
      break;
  }
  return <Container>{content}</Container>;
};
