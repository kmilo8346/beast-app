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
// clients
import userClient from '../../clients/user-client';
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
  const { phone, code } = route.params;
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);

  // event handlers
  const createUser = async () => {
    try {
      loadingOverlayRef.current?.show();
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

      if (!created.first_name) {
        setTimeout(() => {
          navigation.navigate('AddUserData', {
            redirect: route.params.redirect,
          });
        }, 300);
      } else {
        setTimeout(() => {
          navigation.navigate(
            route.params.redirect.name,
            route.params.redirect.params
          );
        }, 300);
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Create user error', error);

        dispatch({ type: 'set_error', error });
      }
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  const changeCodeHandler = (text: string) => {
    if (text !== code) {
      return;
    }
    createUser();
  };

  const retryHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
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
          <Text level={5}>
            {` ${stringFormatter.toPhone(phone, { prefix: true })}`}
          </Text>
        </Text>
        <Input
          autoFocus
          keyboardType="numeric"
          placeholder="Introduce el código enviado"
          style={{ paddingLeft: 10 }}
          onChangeText={changeCodeHandler}
        />
      </ScrollView>
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
