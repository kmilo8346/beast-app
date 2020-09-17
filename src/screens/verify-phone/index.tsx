import React, { useReducer, useEffect, useRef } from 'react';
import { View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import OTPInputView from '@twotalltotems/react-native-otp-input';

// components
import Text from '../../components/text';
import Button from '../../components/buttons/button';
import Toast, { IToast } from '../../components/toast';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../components/loading-overlay';
// clients
import phoneClient from '../../clients/phone-client';
import userClient from '../../clients/user-client';
// cache
import userCache from '../../cache/user';
// types
import { LoggedUser } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[verify phone screen]';

type ChangeUserCodeAction = {
  type: 'change_user_code';
  user_code: string;
};
type AddBeastCodeAction = {
  type: 'add_beast_code';
  beast_code: string;
};
type SetHasVerificationErrorAction = {
  type: 'set_has_verfication_error';
  error: boolean;
};

type Action =
  | ChangeUserCodeAction
  | AddBeastCodeAction
  | SetHasVerificationErrorAction;

type State = {
  user_code: string;
  beast_codes: string[];
  has_verfication_error: boolean;
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_user_code':
      return { ...state, user_code: action.user_code };
    case 'add_beast_code':
      return {
        ...state,
        beast_codes: [...state.beast_codes, action.beast_code],
      };
    case 'set_has_verfication_error':
      return { ...state, has_verfication_error: action.error };
    default:
      return state;
  }
};

interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  // params
  const phone = route.params.phone;
  const redirect = route.params.redirect;
  // state
  const [state, dispatch] = useReducer(reducer, {
    user_code: '',
    beast_codes: [],
    has_verfication_error: false,
  });
  const user = userCache.getData() as LoggedUser;
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const toastRef = useRef<IToast>(null);
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);

  // event handlers
  const sendCode = async (initial = false) => {
    try {
      dispatch({ type: 'set_has_verfication_error', error: false });
      const { code: beast_code } = await phoneClient.code({
        phone,
      });
      dispatch({ type: 'add_beast_code', beast_code });

      if (!initial) {
        toastRef.current?.show({
          type: 'SUCCESS',
          message: 'Codigo reenviado correctamente',
          expiration: 3,
        });
      }
    } catch (error) {
      // TODO: log error
      console.log(error);

      toastRef.current?.show({
        type: 'ERROR',
        message: 'Error al enviar código',
        expiration: 3,
      });
    }
  };

  const changeUserCodeHandler = (userCode: string) => {
    dispatch({ type: 'change_user_code', user_code: userCode });
  };

  const submitHandler = async (code: string) => {
    if (state.beast_codes.indexOf(code) === -1) {
      dispatch({ type: 'set_has_verfication_error', error: true });
      return;
    }

    await userCache.updateData({
      phone,
      phone_verified: true,
    });

    const user = userCache.getData() as LoggedUser;
    if (user.current_address && user.addresses.length) {
      try {
        loadingOverlayRef.current?.show();
        if (user.created_at) {
          // update
          await userClient.update({
            pathVars: {
              id: user.id,
            },
            body: {
              phone,
              phone_verified: user.phone_verified,
            },
          });
        } else {
          // create
          const created = await userClient.create({
            body: user,
          });
          await userCache.setData(created);
        }

        if (redirect.name === 'MainTab') {
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [{ name: 'MainTab' }],
            })
          );
        } else if (redirect.name === 'MenuStack') {
          navigation.pop();
          navigation.pop();
        } else {
          navigation.pop();
          navigation.replace(redirect.name, redirect.params);
        }
      } catch (error) {
        // TODO: log error
        console.log(error);

        toastRef.current?.show({
          type: 'ERROR',
          message: 'Error inesperado, reintente por favor',
          expiration: 3,
        });
      } finally {
        loadingOverlayRef.current?.hide();
      }
    } else {
      navigation.pop();
      navigation.replace('SetAddress');
    }
  };

  useEffect(() => {
    sendCode(true);
  }, [phone]);

  // render logic
  let verficationError = null;
  if (state.has_verfication_error) {
    verficationError = (
      <Text level={7} color={colors.red} style={{ marginLeft: 20 }}>
        El código es incorrecto
      </Text>
    );
  }
  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.white },
        globalStyles.withPadding,
      ]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[{ height: '100%', width: '100%' }]}>
          <Text level={2} weight="bold" style={{ marginBottom: 10 }}>
            Ingresa el código
          </Text>
          <Text style={{ marginBottom: 60 }}>
            <Text level={5} style={{ lineHeight: 25 }}>
              Te enviamos un código de verificación a tu número{' '}
            </Text>
            <Text level={5} weight="bold">
              {phone}
            </Text>
          </Text>
          <OTPInputView
            code={state.user_code}
            onCodeChanged={changeUserCodeHandler}
            pinCount={4}
            autoFocusOnLoad
            style={{
              height: 60,
              marginHorizontal: 20,
              marginBottom: 10,
            }}
            codeInputFieldStyle={{
              width: 60,
              height: 60,
              borderWidth: 1,
              borderColor: colors.blackLight5,
              borderRadius: 13,
              fontSize: 20,
              fontWeight: 'bold',
              color: colors.black,
            }}
            codeInputHighlightStyle={{
              borderColor: colors.blue,
            }}
            onCodeFilled={(code) => {
              submitHandler(code);
            }}
          />
          {verficationError}
          <Button
            type="link"
            title="Reenviar código"
            style={{ marginTop: 10 }}
            onPress={() => {
              Keyboard.dismiss();
              sendCode();
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              marginBottom: 10,
            }}
          >
            <Toast ref={toastRef} />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
