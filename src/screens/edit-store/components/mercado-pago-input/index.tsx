import React, { useReducer, useRef } from 'react';
import { View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

// screen components
import Input from '../../../components/input';
import ConfirmDialog from '../../../components/dialogs/confirm-dialog';
// components
import Text from '../../../../components/text';
import LoadingOverlay, {
  ILoadingOverlay,
  LoadingStatus,
} from '../../../../components/loading-overlay';
import MercadoPagoSmallLogoIcon from '../../../../components/svgs/icons/mercadopago-small-logo';
// clients
import storeClient from '../../../../clients/store-client';
import mpUserClient from '../../../../clients/mercado-pago/user-client';
import mpOauthTokenClient from '../../../../clients/mercado-pago/oauth-token-client';
// cache
import storeCache from '../../../../cache/store';
// libs
import { capture } from '../../../../lib/sentry';
// types
import { MercadoPagoCredentials, PaymentProvider } from '../../../../types';
// styles
import colors from '../../../../styles/colors';

// instances outside component
const prefix = '[mercado pago input component]';

type SetInvalidAccountDialogAction = {
  type: 'set_invalid_account_dialog';
  invalid_account_dialog: boolean;
};
type SetUnexpectedErrorDialogAction = {
  type: 'set_unexpected_error_dialog';
  unexpected_error_dialog: boolean;
};
type SetDisconnectConfirmDialogAction = {
  type: 'set_disconnect_confirm_dialog';
  disconnect_confirm_dialog: boolean;
};
type Action =
  | SetInvalidAccountDialogAction
  | SetUnexpectedErrorDialogAction
  | SetDisconnectConfirmDialogAction;
type State = {
  invalid_account_dialog: boolean;
  unexpected_error_dialog: boolean;
  disconnect_confirm_dialog: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_invalid_account_dialog':
      return {
        ...state,
        invalid_account_dialog: action.invalid_account_dialog,
      };
    case 'set_unexpected_error_dialog':
      return {
        ...state,
        unexpected_error_dialog: action.unexpected_error_dialog,
      };
    case 'set_disconnect_confirm_dialog':
      return {
        ...state,
        disconnect_confirm_dialog: action.disconnect_confirm_dialog,
      };
    default:
      return state;
  }
};

interface ComponentProps {
  id: string;
  provider?: PaymentProvider | null;
}

export default ({ id, provider }: ComponentProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    invalid_account_dialog: false,
    unexpected_error_dialog: false,
    disconnect_confirm_dialog: false,
  });
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);

  // event handlers
  const createCredentials = async (
    code: string
  ): Promise<MercadoPagoCredentials> => {
    return mpOauthTokenClient.create({ body: { code } });
  };

  const getUser = async (id: string) => {
    return mpUserClient.get({
      pathVars: {
        id,
      },
      source: ['site_id'],
    });
  };

  const updateStore = async (payment_provider: PaymentProvider | null) => {
    const storeUpdated = await storeClient.update({
      pathVars: {
        id,
      },
      body: {
        payment_provider,
      },
    });
    storeCache.updateData(storeUpdated);
  };

  const connect = async () => {
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
          throw new Error(`${prefix} Invalid redirect state`);
        }

        await loadingOverlayRef.current?.show();
        const credentials = await createCredentials(
          redirectData.queryParams.code
        );
        const user = await getUser(`${credentials.user_id}`);
        if (user.site_id !== 'MLC') {
          setTimeout(() => {
            dispatch({
              type: 'set_invalid_account_dialog',
              invalid_account_dialog: true,
            });
          }, 500);

          return;
        }
        await updateStore({ credentials });
        loadingOverlayRef.current?.status(LoadingStatus.OK);
      }
    } catch (error) {
      capture(prefix, 'Connect error', error);

      setTimeout(() => {
        dispatch({
          type: 'set_unexpected_error_dialog',
          unexpected_error_dialog: true,
        });
      }, 500);
    } finally {
      await loadingOverlayRef.current?.hide();
    }
  };

  const disconnect = async () => {
    try {
      await loadingOverlayRef.current?.show();
      await updateStore(null);
      loadingOverlayRef.current?.status(LoadingStatus.OK);
    } catch (error) {
      capture(prefix, 'Disconnect error', error);

      setTimeout(() => {
        dispatch({
          type: 'set_unexpected_error_dialog',
          unexpected_error_dialog: true,
        });
      }, 500);
    } finally {
      await loadingOverlayRef.current?.hide();
    }
  };

  const pressInputHandler = () => {
    if (provider) {
      dispatch({
        type: 'set_disconnect_confirm_dialog',
        disconnect_confirm_dialog: true,
      });
    } else {
      connect();
    }
  };

  const invalidAccountDialogOkHandler = () => {
    dispatch({
      type: 'set_invalid_account_dialog',
      invalid_account_dialog: false,
    });
    connect();
  };

  const invalidAccountDialogCancelHandler = () => {
    dispatch({
      type: 'set_invalid_account_dialog',
      invalid_account_dialog: false,
    });
  };

  const unexpectedErrorDialogOkHandler = () => {
    dispatch({
      type: 'set_unexpected_error_dialog',
      unexpected_error_dialog: false,
    });
    connect();
  };

  const unexpectedErrorDialogCancelHandler = () => {
    dispatch({
      type: 'set_unexpected_error_dialog',
      unexpected_error_dialog: false,
    });
  };

  const disconnectConfirmDialogOkHandler = () => {
    dispatch({
      type: 'set_disconnect_confirm_dialog',
      disconnect_confirm_dialog: false,
    });
    disconnect();
  };

  const disconnectConfirmDialogCancelHandler = () => {
    dispatch({
      type: 'set_disconnect_confirm_dialog',
      disconnect_confirm_dialog: false,
    });
  };

  // render logic
  let text = 'Conectar a Mercado Pago';
  let action = (
    <Text level={6} weight="bold" color={colors.blue}>
      Conectar
    </Text>
  );
  if (provider) {
    text = 'Conectado';
    action = (
      <Text level={6} weight="bold" color={colors.blackLight4}>
        Desconectar
      </Text>
    );
  }
  return (
    <View>
      <Input
        label="Vínculo de pago"
        value={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MercadoPagoSmallLogoIcon />
            <Text
              level={6}
              color={colors.blackLight4}
              style={{ marginLeft: 5 }}
            >
              {text}
            </Text>
          </View>
        }
        icon={action}
        onPress={pressInputHandler}
      />
      {state.invalid_account_dialog && (
        <ConfirmDialog
          title="Cuenta no válida en Chile"
          message="Su cuenta no es válida en Chile, por favor reintente con otro correo."
          okText="Reintentar"
          onOk={invalidAccountDialogOkHandler}
          onCancel={invalidAccountDialogCancelHandler}
        />
      )}
      {state.unexpected_error_dialog && (
        <ConfirmDialog
          title="No pudimos agregar el proveedor"
          message="Ocurrio un error y no pudimos agregar el proveedor en este instante."
          okText="Reintentar"
          onOk={unexpectedErrorDialogOkHandler}
          onCancel={unexpectedErrorDialogCancelHandler}
        />
      )}
      {state.disconnect_confirm_dialog && (
        <ConfirmDialog
          title="¿Seguro que quieres desconectar Mercado Pago?"
          okText="Si, Continuar"
          onOk={disconnectConfirmDialogOkHandler}
          onCancel={disconnectConfirmDialogCancelHandler}
        />
      )}
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
