import React, { useEffect, useReducer, useRef } from 'react';
import { View, ScrollView, GestureResponderEvent } from 'react-native';
import axios, { CancelTokenSource } from 'axios';

// components
import Text from '../../components/text';
import Input from '../../components/inputs/input';
import Button from '../../components/buttons/button';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../components/loading-overlay';
import Toast, { IToast } from '../../components/toast';
// clients
import userClient from '../../clients/user-client';
import phoneClient from '../../clients/phone-client';
// libs
import { capture } from '../../lib/sentry';
import stringFormatter from '../../lib/formatters/string-formatter';
// cache
import userCache from '../../cache/user';
// styles
import globalStyles from '../../styles';
import colors from '../../styles/colors';

// instances outside component
const prefix = '[verify phone screen]';
let createRequestSource: CancelTokenSource;

type ResetAction = {
  type: 'reset';
};
type SetErrorAction = {
  type: 'set_error';
  error: Error;
};
type Action = ResetAction | SetErrorAction;
type State = {
  error?: Error;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'reset':
      return { ...state, error: undefined };
    case 'set_error':
      return { ...state, error: action.error };
    default:
      return state;
  }
};

interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {});
  const { phone, codes } = route.params;
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);
  const toastRef = useRef<IToast>(null);

  // event handlers
  const createUser = async () => {
    try {
      await loadingOverlayRef.current?.show();
      dispatch({ type: 'reset' });
      // creating user
      if (createRequestSource) {
        createRequestSource.cancel();
      }
      createRequestSource = axios.CancelToken.source();
      const cache = userCache.getData();
      const created = await userClient.create({
        body: {
          ...cache,
          phone,
          phone_verified: true,
        },
      });
      userCache.setData(created);

      setTimeout(() => {
        navigation.pop();
        navigation.replace(
          route.params.redirect.name,
          route.params.redirect.params
        );
      }, 300);
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Create user error', error);

        dispatch({ type: 'set_error', error });
      }
    } finally {
      await loadingOverlayRef.current?.hide();
    }
  };

  const changeCodeHandler = (text: string) => {
    if (codes.indexOf(text) === -1) {
      return;
    }
    createUser();
  };

  const retryHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
  };

  const pressResendCodeHandler = async (event: GestureResponderEvent) => {
    event.stopPropagation();
    try {
      await loadingOverlayRef.current?.show();
      const response = await phoneClient.code({
        phone,
      });
      navigation.setParams({
        ...route.params,
        phone: response.phone,
        code: [...codes, response.code],
      });
      toastRef.current?.show({
        type: 'INFO',
        message: 'Código reenviado correctamente',
        expiration: 3,
      });
    } catch (error) {
      capture(prefix, 'Press resend code handler error', error);

      toastRef.current?.show({
        type: 'ERROR',
        message: 'No se pudo reenviar el código, reintente',
        expiration: 3,
      });
    } finally {
      await loadingOverlayRef.current?.hide();
    }
  };

  useEffect(() => {
    return () => {
      createRequestSource && createRequestSource.cancel();
    };
  }, []);

  // render logic
  if (state.error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.white,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text level={6} weight="bold" style={{ marginBottom: 15 }}>
          Ocurrió un error inesperado
        </Text>
        <Text level={6} style={{ marginBottom: 10 }}>
          El error fue registrado para su solución
        </Text>
        <Button title="Reintentar" type="link" onPress={retryHandler} />
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={[{ flex: 1 }, globalStyles.withPadding]}>
        <Text
          level={2}
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginBottom: 10 }}
        >
          Ingresa el código
        </Text>
        <Text
          level={5}
          weight="light"
          style={{ marginBottom: 60, lineHeight: 23 }}
        >
          Te enviamos un código de verificación a tu número de teléfono
          <Text level={5}>{` ${stringFormatter.toPhone(phone)}`}</Text>
        </Text>
        <Input
          autoFocus
          keyboardType="numeric"
          placeholder="Introduce el código enviado"
          onChangeText={changeCodeHandler}
        />
        <Button
          type="link"
          title={
            <Text level={7} color={colors.blue}>
              Reenviar código sms
            </Text>
          }
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: 0,
            paddingLeft: 4,
          }}
          onPress={pressResendCodeHandler}
        />
      </ScrollView>
      <View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
          globalStyles.withMargin,
        ]}
      >
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
      </View>
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
