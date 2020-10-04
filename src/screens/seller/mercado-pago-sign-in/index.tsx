import React, { ReactNode, useReducer, useRef } from 'react';
import { Vibration, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { CommonActions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

// components
import Text from '../../../components/text';
import Icon from '../../../components/icon';
import Button from '../../../components/buttons/button';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../../components/loading-overlay';
import Toast, { IToast } from '../../../components/toast';
import MercadopagoImage from '../../../components/svgs/images/mercadopago-logo';
// clients
import mpOauthTokenClient from '../../../clients/mercado-pago/oauth-token-client';
import mpUserClient from '../../../clients/mercado-pago/user-client';
import storeClient from '../../../clients/store-client';
import userClient from '../../../clients/user-client';
// libs
import { capture } from '../../../lib/sentry';
// types
import { SellerCredentials } from '../../../types';
// cache
import userCache from '../../../cache/user';
import storeCache from '../../../cache/store';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[mercado pago sign in screen]';
const mercado_libre_cancel_urls: { [key: string]: string } = {
  MCO: 'https://myaccount.mercadolibre.com.co/cancelar-cuenta',
  MLV: 'https://myaccount.mercadolibre.com.ve/cancelar-cuenta',
};

enum MercadoPagoSignInView {
  ONBOARDING = 'onboarding',
  VALID_ACCOUNT = 'valid_account',
  INVALID_ACCOUNT = 'invalid_account',
}
type ChangeViewAction = {
  type: 'change_view';
  view: MercadoPagoSignInView;
};
type SetLinkModalAction = {
  type: 'set_link_modal';
  link_modal: boolean;
};
type SetValidAccountAction = {
  type: 'set_valid_account';
  mp_code: string;
  mp_credentials: SellerCredentials;
  mp_user: any;
};
type SetInValidAccountAction = {
  type: 'set_invalid_account';
  mp_code: string;
  mp_credentials: SellerCredentials;
  mp_user: any;
};
type Action =
  | ChangeViewAction
  | SetLinkModalAction
  | SetValidAccountAction
  | SetInValidAccountAction;
type State = {
  view: MercadoPagoSignInView;
  link_modal: boolean;
  mp_code?: string;
  mp_credentials?: SellerCredentials;
  mp_user?: any;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_view':
      return { ...state, view: action.view };
    case 'set_link_modal':
      return { ...state, link_modal: action.link_modal };
    case 'set_valid_account':
      return {
        ...state,
        view: MercadoPagoSignInView.VALID_ACCOUNT,
        mp_code: action.mp_code,
        mp_credentials: action.mp_credentials,
        mp_user: action.mp_user,
      };
    case 'set_invalid_account':
      return {
        ...state,
        view: MercadoPagoSignInView.INVALID_ACCOUNT,
        mp_code: action.mp_code,
        mp_credentials: action.mp_credentials,
        mp_user: action.mp_user,
      };
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
    view: MercadoPagoSignInView.ONBOARDING,
    link_modal: false,
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
  const toastRef = useRef<IToast>(null);

  // event handlers
  const createCredentials = async (
    code: string
  ): Promise<SellerCredentials> => {
    return mpOauthTokenClient.create({ body: { code } });
  };

  const getUser = async (id: string) => {
    return mpUserClient.get({
      pathVars: {
        id,
      },
      source: ['nickname', 'site_id'],
    });
  };

  const setAccount = async (code: string) => {
    try {
      dispatch({ type: 'change_view', view: MercadoPagoSignInView.ONBOARDING });
      loadingOverlayRef.current?.show();
      const credentials = await createCredentials(code);
      const user = await getUser(`${credentials.user_id}`);
      if (user.site_id === 'MLC') {
        dispatch({
          type: 'set_valid_account',
          mp_code: code,
          mp_credentials: credentials,
          mp_user: user,
        });
      } else {
        dispatch({
          type: 'set_invalid_account',
          mp_code: code,
          mp_credentials: credentials,
          mp_user: user,
        });
      }
    } catch (error) {
      capture(prefix, 'Set account error', error);

      Vibration.vibrate(400);
      toastRef.current?.show({
        message: 'Ocurrió un error, reintenta por favor',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  const openLinkAccount = async () => {
    const redirect = Linking.makeUrl();
    if (!redirect) {
      throw new Error(`${prefix} Redirect must be defined`);
    }
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `${Constants.manifest.extra.BEAST_API_URL}/mercadopago/authorization?redirect=${redirect}`,
        redirect
      );
      if (result.type === 'success') {
        const redirectData = Linking.parse(result.url);
        if (
          redirectData.queryParams?.status !== 'ok' ||
          !redirectData.queryParams?.code
        ) {
          throw new Error('');
        }

        setAccount(redirectData.queryParams.code);
      }
    } catch (error) {
      capture(prefix, 'Open link account error', error);

      Vibration.vibrate(400);
      toastRef.current?.show({
        message: 'Ocurrió un error, reintenta por favor',
        type: 'ERROR',
        expiration: 3,
      });
    }
  };

  const openMercadoLibreGlobal = () => {
    WebBrowser.openBrowserAsync(
      mercado_libre_cancel_urls[state.mp_user.site_id] ||
        'https://mercadolibre.com'
    );
  };

  const pressLinkMercadoPagoAccountHandler = () => {
    openLinkAccount();
  };

  const pressLinkAgainHandler = () => {
    openLinkAccount();
  };

  const pressCancelAccountHandler = () => {
    openMercadoLibreGlobal();
  };

  const pressLetsStartHandler = async () => {
    try {
      loadingOverlayRef.current?.show();
      // create store in api
      const created = await storeClient.create({
        body: {
          ...store,
          seller_credentials: state.mp_credentials as SellerCredentials,
        },
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
      capture(prefix, 'Press lets start handler error', error);

      Vibration.vibrate(400);
      toastRef.current?.show({
        message: 'Ocurrió un error, reintenta por favor',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  // render logic
  let content: ReactNode | null = null;
  switch (state.view) {
    case MercadoPagoSignInView.VALID_ACCOUNT:
      content = (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text level={1} weight="bold" style={{ marginBottom: 15 }}>
            ¡Genial!
          </Text>
          <Text level={5} style={{ marginBottom: 20 }}>
            Estamos listos para empezar a vender.
          </Text>
          <Button
            type="link"
            title="Volver a vincular"
            onPress={pressLinkAgainHandler}
          />

          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
            <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
            <Button
              title="Comencemos"
              onPress={pressLetsStartHandler}
              style={globalStyles.withMainActionAir}
            />
          </View>
        </View>
      );
      break;
    case MercadoPagoSignInView.INVALID_ACCOUNT:
      content = (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text level={1} weight="bold" style={{ marginBottom: 15 }}>
            ¡Ups!
          </Text>
          <Text level={5} style={{ marginBottom: 70 }}>
            La cuenta no funciona en Chile
          </Text>

          <View style={{ flexDirection: 'row' }}>
            <Icon
              name="info"
              color={colors.red}
              size={20}
              style={{ marginRight: 10 }}
            />

            <View style={{ flex: 1 }}>
              <Text level={7} style={{ lineHeight: 17, marginBottom: 10 }}>
                Para solucionar este problema tienes dos tipos de soluciones
              </Text>

              <Text level={7} weight="bold" style={{ marginBottom: 2 }}>
                Usando otro correo
              </Text>
              <Text level={7} style={{ marginBottom: 20, lineHeight: 17 }}>
                {`    `}
                <Text level={7} weight="bold">
                  1 -{` `}
                </Text>
                Crear una nueva cuenta con otro correo{' '}
                <Text
                  level={7}
                  weight="bold"
                  color={colors.blue}
                  onPress={pressLinkAgainHandler}
                >
                  link
                </Text>
              </Text>

              <Text level={7} weight="bold" style={{ marginBottom: 5 }}>
                Usando el mismo correo
              </Text>
              <Text level={7} style={{ marginBottom: 5, lineHeight: 17 }}>
                {`    `}
                <Text level={7} weight="bold">
                  1 -{` `}
                </Text>
                Cancelar cuenta en la página de tu país{' '}
                <Text
                  level={7}
                  weight="bold"
                  color={colors.blue}
                  onPress={pressCancelAccountHandler}
                >
                  link
                </Text>
              </Text>
              <Text level={7} style={{ marginBottom: 5, lineHeight: 17 }}>
                {`    `}
                <Text level={7} weight="bold">
                  2 -{` `}
                </Text>
                Crear la cuenta en chile{' '}
                <Text
                  level={7}
                  weight="bold"
                  color={colors.blue}
                  onPress={pressLinkAgainHandler}
                >
                  link
                </Text>
              </Text>
            </View>
          </View>

          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
            <Button
              title="Comencemos"
              disabled
              style={globalStyles.withMainActionAir}
              onPress={pressLetsStartHandler}
            />
          </View>
        </View>
      );
      break;
    default:
      content = (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            paddingTop: '18%',
          }}
        >
          <MercadopagoImage />
          <Text
            level={2}
            weight="bold"
            style={{ marginBottom: 15, marginTop: 20 }}
          >
            ¡Bien! casi listo…
          </Text>
          <Text level={5} style={{ lineHeight: 23, textAlign: 'center' }}>
            Solo nos falta vincular tu cuenta de{' '}
            <Text level={5} weight="bold">
              Mercado Pago
            </Text>
            {` `} para que cobres lo que vendes. Shop Shop{' '}
            <Text level={5} weight="bold">
              nunca guarda
            </Text>{' '}
            tu dinero.
          </Text>

          <View
            style={[{ position: 'absolute', bottom: 0, left: 0, right: 0 }]}
          >
            <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
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
                podrás cobrar con múltiples medios de pagos, retirar ganancias,
                realizar devoluciones y ver métricas.
              </Text>
            </View>
            <Button
              title="Vincular cuenta"
              onPress={pressLinkMercadoPagoAccountHandler}
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
