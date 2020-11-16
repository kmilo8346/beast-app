import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

// screen components
import FakeInput from '../../../components/fake-input';
// screen components
import ConfirmDialog from '../../../components/dialogs/confirm-dialog';
import InfoDialog from '../../../components/dialogs/info-dialog';
// components
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../../../components/loading-overlay';
// clients
import mpOauthTokenClient from '../../../../clients/mercado-pago/oauth-token-client';
import mpUserClient from '../../../../clients/mercado-pago/user-client';
// libs
import { capture } from '../../../../lib/sentry';
// types
import { MercadoPagoCredentials, PaymentProvider } from '../../../../types';
// lib
import * as utils from '../../../../lib/utils';

// instances outside component
const prefix = '[set payment provider input component]';

interface ComponentProps {
  value?: PaymentProvider;
  errors?: string[];
  onChange?: (paymentProvider: PaymentProvider) => void;
}

export default ({ value, errors, onChange = utils.noop }: ComponentProps) => {
  // state
  const [invalidAccountDialog, setInvalidAccountDialog] = useState(false);
  const [unexpectedErrorDialog, setUnexpectedErrorDialog] = useState(false);
  const [providerAddedDialog, setProviderAddedDialog] = useState(false);
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

  const openPaymentProviderView = async () => {
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

        loadingOverlayRef.current?.show();
        const credentials = await createCredentials(
          redirectData.queryParams.code
        );
        const user = await getUser(`${credentials.user_id}`);
        if (user.site_id !== 'MLC') {
          setInvalidAccountDialog(true);
          return;
        }
        onChange({ credentials });
        setProviderAddedDialog(true);
      }
    } catch (error) {
      capture(prefix, 'Open payment provider view error', error);

      setUnexpectedErrorDialog(true);
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  const inputPressHandler = () => {
    openPaymentProviderView();
  };

  const invalidAccountDialogOkHandler = () => {
    setInvalidAccountDialog(false);
    openPaymentProviderView();
  };

  const invalidAccountDialogCancelHandler = () => {
    setInvalidAccountDialog(false);
  };

  const unexpectedErrorDialogOkHandler = () => {
    setUnexpectedErrorDialog(false);
    openPaymentProviderView();
  };

  const unexpectedErrorDialogCancelHandler = () => {
    setUnexpectedErrorDialog(false);
  };

  const providerAddedDialogOkHandler = () => {
    setProviderAddedDialog(false);
  };

  // render logic
  let text = '';
  if (value) {
    text = 'Mercado Pago';
  }
  return (
    <View>
      <FakeInput
        required={false}
        label="Vínculo de pago"
        placeholder="Agrega proveedor de pago"
        suffix="chevron-down"
        value={text}
        errors={errors}
        onPress={inputPressHandler}
      />
      <LoadingOverlay ref={loadingOverlayRef} />
      {invalidAccountDialog && (
        <ConfirmDialog
          title="Cuenta no válida en Chile"
          message="Su cuenta no es válida en Chile, por favor reintente con otro correo."
          okText="Reintentar"
          onOk={invalidAccountDialogOkHandler}
          onCancel={invalidAccountDialogCancelHandler}
        />
      )}
      {unexpectedErrorDialog && (
        <ConfirmDialog
          title="No pudimos agregar el proveedor"
          message="Ocurrio un error y no pudimos agregar el proveedor en este instante."
          okText="Reintentar"
          onOk={unexpectedErrorDialogOkHandler}
          onCancel={unexpectedErrorDialogCancelHandler}
        />
      )}
      {providerAddedDialog && (
        <InfoDialog
          title="Proveedor agregado correctamente"
          message="El proveedor de pagos Mercado Pago fue agregado correctamente."
          onOk={providerAddedDialogOkHandler}
        />
      )}
    </View>
  );
};
