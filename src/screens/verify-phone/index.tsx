import React, { useReducer, useEffect, useRef } from 'react';
import { View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import OTPInputView from '@twotalltotems/react-native-otp-input';

// components
import { Container, Text, Button, Toast, IToast } from '../../components';
// clients
import phoneClient from '../../clients/phone-client';
import userClient from '../../clients/user-client';
// libs
import firebase from '../../lib/firebase';
// containers
import UserProvider from '../../containers/user';
// styles
import colors from '../../styles/colors';

// instances outside component
const prefix = '[verify phone screen]';

type ChangeCodeAction = {
  type: 'change_code';
  code: string;
};
type SetHasVerificationErrorAction = {
  type: 'set_has_verfication_error';
  hasError: boolean;
};
type SetSubmitOpIdAction = {
  type: 'set_submit_op_id';
  opId: string;
};

type Action =
  | ChangeCodeAction
  | SetHasVerificationErrorAction
  | SetSubmitOpIdAction;

type State = {
  code: string;
  hasVerficationError: boolean;
  submitOpId?: string;
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_code':
      return { ...state, code: action.code };
    case 'set_has_verfication_error':
      return { ...state, hasVerficationError: action.hasError };
    case 'set_submit_op_id':
      return {
        ...state,
        submitOpId: action.opId,
      };
    default:
      return state;
  }
};

export interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    code: '',
    hasVerficationError: false,
  });
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();
  const toastRef = useRef<IToast>(null);

  // preconditions
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }

  // event handlers
  const submitHandler = async (code: string) => {
    try {
      if ((user.metaData.codes || []).indexOf(code) !== -1) {
        const opId = `${new Date().getTime()}`;
        userClient.update(
          user.id,
          {
            phoneVerified: true,
            'metaData.codes': [],
          },
          opId
        );
        dispatch({ type: 'set_submit_op_id', opId });
        return;
      }
      dispatch({ type: 'set_has_verfication_error', hasError: true });
    } catch (error) {
      // TODO: log error and show toast
    }
  };
  const changeCodeHandler = (code: string) => {
    dispatch({ type: 'change_code', code });
  };
  const sendCode = async (initial = false) => {
    try {
      dispatch({ type: 'set_has_verfication_error', hasError: false });
      const { code } = await phoneClient.code({
        phone: user?.phone as string,
      });
      await userClient.update(
        user.id,
        {
          'metaData.codes': firebase.firestore.FieldValue.arrayUnion(code),
        },
        `${new Date().getTime()}`
      );
      if (!initial) {
        toastRef.current?.show({
          type: 'SUCCESS',
          message: 'Codigo reenviado correctamente',
          expiration: 3,
        });
      }
    } catch (error) {
      toastRef.current?.show({
        type: 'ERROR',
        message: 'Error al enviar código',
        expiration: 3,
      });
    }
  };
  useEffect(() => {
    if (user?.phone) {
      sendCode(true);
    }
  }, [user?.phone]);
  useEffect(() => {
    // phone was verified
    if (user.opId === state.submitOpId && user.phoneVerified) {
      // not current address
      if (!user.currentAddress) {
        navigation.replace('SetAddress');
        return;
      }
      // redirect to MainTab
      if (route.params.redirect.name === 'MainTab') {
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: 'MainTab' }],
          })
        );
        return;
      }
      // redirect to SellerDashboard
      if (route.params.redirect.name === 'SellerDashboard') {
        const store = user.store;
        if (!store || !store.name || !store.images) {
          navigation.replace('SetStoreInfo');
          return;
        }
        if (!store.deliveryArea || !store.deliveryTime || !store.openingHours) {
          navigation.replace('SetStoreDeliveryInfo');
          return;
        }
        if (!store.sellerCredentials?.userId) {
          navigation.replace('MercadoPagoSignIn');
          return;
        }
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: 'SellerDashboard' }],
          })
        );
        return;
      }

      navigation.pop();
      navigation.replace(route.params.redirect.name);
    }
  }, [state.submitOpId, user.phoneVerified]);

  // render logic
  let verficationError = null;
  if (state.hasVerficationError) {
    verficationError = (
      <Text level={7} color={colors.red} style={{ marginLeft: 20 }}>
        El código es incorrecto
      </Text>
    );
  }
  return (
    <Container safeArea withMargin>
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
              {user?.phone}
            </Text>
          </Text>
          <OTPInputView
            code={state.code}
            onCodeChanged={changeCodeHandler}
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
    </Container>
  );
};
