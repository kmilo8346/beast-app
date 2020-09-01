import React, { useReducer, useRef } from 'react';
import { View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { CommonActions } from '@react-navigation/native';
import Constants from 'expo-constants';

// components
import Text from '../../../components/text';
import Icon from '../../../components/icon';
import Button from '../../../components/buttons/button';
import ErrorView from '../../../components/error-view';
import Loading from '../../../components/loading';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../../components/loading-overlay';
import MercadopagoImage from '../../../components/svgs/images/mercadopago-logo';
// clients
import oauthTokenClient from '../../../clients/mercado-pago/oauth-token-client';
import storeClient from '../../../clients/store-client';
import userClient from '../../../clients/user-client';
// types
import { CreateStore } from '../../../types';
// cache
import userCache from '../../../cache/user';
import storeCache from '../../../cache/store';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[mercado pago sign in screen]';

type ShowLoadingAction = {
  type: 'show_loading';
};
type ShowErrorAction = {
  type: 'show_error';
};
type ShowReadyAction = {
  type: 'show_ready';
};
type Action = ShowLoadingAction | ShowErrorAction | ShowReadyAction;
type State = {
  view: 'MERCADO_PAGO_BENEFITS' | 'LOADING' | 'ERROR' | 'READY';
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'show_loading':
      return { ...state, view: 'LOADING' };
    case 'show_error':
      return { ...state, view: 'ERROR' };
    case 'show_ready':
      return { ...state, view: 'READY' };
    default:
      return state;
  }
};

export interface ScreenProps {
  navigation: any;
}

/**
 * @site https://github.com/expo/examples/blob/master/with-webbrowser-redirect
 */
export default ({ navigation }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    view: 'MERCADO_PAGO_BENEFITS',
  });
  const user = userCache.getData();
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const store = storeCache.getData();
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);

  // event handlers
  const createCredentials = async (code: string) => {
    try {
      dispatch({ type: 'show_loading' });
      const credentials = await oauthTokenClient.create({ body: { code } });
      await storeCache.updateData({
        seller_credentials: credentials,
      });
      dispatch({ type: 'show_ready' });
    } catch (error) {
      console.log(error);
      // TODO: log error
      dispatch({ type: 'show_error' });
    }
  };
  const openMercadoPagoSignIn = async () => {
    const redirect = Linking.makeUrl();
    if (!redirect) {
      throw new Error(`${prefix} Redirect must be defined`);
    }
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `${Constants.manifest.extra.MERCADO_PAGO_AUTH_URL}?client_id=${Constants.manifest.extra.MERCADO_PAGO_AUTH_CLIENT_ID}&response_type=code&platform_id=mp&state=${redirect}&redirect_uri=${Constants.manifest.extra.MERCADO_PAGO_AUTH_REDIRECT_URI}`,
        redirect
      );
      if (result.type === 'success') {
        const redirectData = Linking.parse(result.url);
        if (
          redirectData.queryParams?.status !== 'ok' ||
          !redirectData.queryParams?.code
        ) {
          dispatch({ type: 'show_error' });
          return;
        }
        createCredentials(redirectData.queryParams.code);
      }
    } catch (error) {
      console.log(error);
      // TODO: log error
      dispatch({ type: 'show_error' });
    }
  };
  const pressMercadoPagoSignInHandler = async () => {
    openMercadoPagoSignIn();
  };
  const pressLetsStart = async () => {
    try {
      loadingOverlayRef.current?.show();
      // create store in api
      const created = await storeClient.create({
        body: storeCache.getData() as CreateStore,
      });
      // set current store
      await userClient.update({
        pathVars: {
          id: user.id,
        },
        body: {
          current_store: created.id,
        },
      });
      storeCache // set created store in cache
        .setData(created);
      // navigate
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: 'SellerDashboard' }],
        })
      );
    } catch (error) {
      // TODO: log error
      console.log(error);
      dispatch({ type: 'show_error' });
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };
  const retryHandler = () => {
    const store = storeCache.getData();
    if (!store?.seller_credentials) {
      openMercadoPagoSignIn();
    } else {
      pressLetsStart();
    }
  };

  // render logic
  let content = null;
  switch (state.view) {
    case 'LOADING':
      content = (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Loading />
        </View>
      );
      break;
    case 'ERROR':
      content = <ErrorView onRetry={retryHandler} />;
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
        <View style={{ flex: 1, alignItems: 'center', paddingTop: '18%' }}>
          <MercadopagoImage />
          <Text
            level={2}
            weight="bold"
            style={{ marginBottom: 15, marginTop: 20 }}
          >
            ¡Bien! casi listo…
          </Text>
          <Text level={5} style={{ lineHeight: 23 }}>
            Solo nos falta un último paso, ingresa o crea una cuenta de{' '}
            <Text level={5} weight="bold">
              Mercado Pago
            </Text>
            .
          </Text>

          <View
            style={[
              { position: 'absolute', bottom: 0, left: 0, right: 0 },
              globalStyles.withMargin,
            ]}
          >
            <View style={{ flexDirection: 'row', marginBottom: 25 }}>
              <Icon
                name="info"
                color={colors.red}
                size={20}
                style={{ marginRight: 10 }}
              />
              <Text level={7} style={{ lineHeight: 17, flex: 1 }}>
                Con{' '}
                <Text level={7} weight="bold">
                  Mercado Pago
                </Text>{' '}
                podrás gestionar tus ventas con tarjetas bancarias, retirar
                ganancias, realizar devoluciones y transferencias.
              </Text>
            </View>
            <Button
              title="Ingresar a Mercado Pago"
              onPress={pressMercadoPagoSignInHandler}
              style={globalStyles.withMainActionAir}
            />
          </View>
        </View>
      );
      break;
  }
  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.white },
        globalStyles.withPadding,
      ]}
    >
      {content}
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
