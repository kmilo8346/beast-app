import React, { useReducer, ReactNode } from 'react';
import { View, Platform } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';

// components
import Loading from '../../components/loading';
import Text from '../../components/text';
import Button from '../../components/buttons/button';
import BagLogoBackgroundBlue from '../../components/svgs/images/bag-logo-background-blue';
import ErrorView from '../../components/error-view';
// local components
import ButtonGoogle from './components/button-google';
import ButtonFacebook from './components/button-facebook';
import ButtonApple from './components/button-apple';
// clients
import userClient from '../../clients/user-client';
// libs
import firebase from '../../lib/firebase';
import * as utils from '../../lib/utils';
// types
import { User, Place, LoggedUser, AnonymouslyUser } from '../../types';
// cache
import userCache from '../../cache/user';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';
import { capture } from '../../lib/sentry';

// instances outside component
const prefix = '[sign in screen]';
const auth = firebase.auth();

enum SignInView {
  LOADING = 'loading',
  ERROR = 'error',
  SIGN_IN_FORM = 'sign_in_form',
  LINK_FORM = 'link_form',
}
type ChangeViewAction = {
  type: 'change_view';
  view: SignInView;
};
type ShowLinkFormAction = {
  type: 'set_link_form';
  info: {
    singInMethod: string;
    credentialToLink: firebase.auth.OAuthCredential;
  };
};
type Action = ChangeViewAction | ShowLinkFormAction;

type State = {
  view: SignInView;
  linkFormInfo: {
    singInMethod: string;
    credentialToLink: firebase.auth.OAuthCredential;
  } | null;
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_view':
      return {
        ...state,
        view: action.view,
      };
    case 'set_link_form':
      return {
        ...state,
        view: SignInView.LINK_FORM,
        linkFormInfo: action.info,
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
  // params
  const redirect = route.params?.redirect || { name: 'MainRootStack' };
  const dont_allow_guest = route.params.dont_allow_guest;
  const reason = route.params.reason;
  // state
  const [state, dispatch] = useReducer(reducer, {
    view: SignInView.SIGN_IN_FORM,
    linkFormInfo: null,
  });
  const insets = useSafeAreaInsets();

  // event handlers
  const removeAnonymously = async (
    anonymously: firebase.User | null,
    newUser: firebase.User
  ) => {
    try {
      if (anonymously?.uid === newUser.uid) {
        return;
      }
      if (anonymously) {
        await Promise.all([
          anonymously.delete(),
          userClient.delete({
            pathVars: {
              id: anonymously.uid,
            },
          }),
        ]);
      }
    } catch (error) {
      capture(prefix, 'Remove anonymously uers error', error);
    }
  };

  const fetchUser = async (id: string): Promise<User | null> => {
    let user: User | null = null;
    try {
      user = await userClient.get({
        pathVars: {
          id,
        },
      });
    } catch (error) {
      if (error.response?.status !== 404) {
        throw error;
      }
    }
    return user;
  };

  const signInOkHandler = async (info: {
    credential: firebase.auth.OAuthCredential;
    appleCredential?: AppleAuthentication.AppleAuthenticationCredential;
    credentialToLink?: firebase.auth.OAuthCredential;
  }) => {
    try {
      dispatch({ type: 'change_view', view: SignInView.LOADING });
      const prevAuthUser = auth.currentUser;
      const prevUser = userCache.getData();
      const result = await auth.signInWithCredential(info.credential);
      if (!result.user) {
        throw new Error(
          `${prefix} Auth user must be defined after a successful signin`
        );
      }

      // removing anonymously user
      removeAnonymously(prevAuthUser, result.user);
      // linking current auth user with credential to link
      if (info.credentialToLink) {
        await result.user.linkWithCredential(info.credentialToLink);
      }
      // init user
      const user = await fetchUser(result.user.uid);
      if (user) {
        let update: any = null;
        // merge address info
        if (prevUser?.current_address && prevUser.addresses?.length) {
          const addressIds = prevUser.addresses.map(
            (address: Place) => address.id
          );
          const addresses = Array.prototype.concat(
            prevUser.addresses,
            (user.addresses || []).filter(
              (address: Place) => addressIds.indexOf(address.id) === -1
            )
          );
          const current_address =
            prevUser.current_address || user.current_address;

          update = update || {};
          update.current_address = current_address;
          update.addresses = addresses;
        }
        // merge phone
        if (prevUser?.phone) {
          update = update || {};
          update.phone = prevUser.phone;
          update.phone_verified = false;
        }

        if (update) {
          await userClient.update({
            pathVars: { id: user.id },
            body: update,
          });
        }
        await userCache.setData({ ...user, ...update });
      } else {
        const newUser = utils.extract({
          authUser: result.user,
          profile: result.additionalUserInfo?.profile || undefined,
          appleCredential: info.appleCredential,
        });
        // set address info from the prev user
        if (prevUser?.current_address && prevUser.addresses?.length) {
          newUser.current_address = prevUser.current_address;
          newUser.addresses = prevUser.addresses;
        }
        // set phone from the prev user
        if (prevUser?.phone) {
          newUser.phone = prevUser?.phone;
          newUser.phone_verified = false;
        }
        // create user in beast api
        const created = await userClient.create({
          body: newUser as LoggedUser,
        });
        await userCache.setData(created);
      }

      if (redirect.name === 'MainRootStack') {
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: 'MainRootStack' }],
          })
        );
      } else {
        navigation.navigate(redirect.name, redirect.params);
      }
    } catch (error) {
      if (
        (error as firebase.auth.AuthError).code ===
        'auth/account-exists-with-different-credential'
      ) {
        const signInMethods = await firebase
          .auth()
          .fetchSignInMethodsForEmail(
            (error as firebase.auth.AuthError).email as string
          );
        if (signInMethods.length) {
          dispatch({
            type: 'set_link_form',
            info: {
              singInMethod: signInMethods[0],
              credentialToLink: (error as firebase.auth.AuthError)
                .credential as firebase.auth.AuthCredential,
            },
          });
        }
        return;
      }
      capture(prefix, 'Sign in ok handler error', error);
      dispatch({ type: 'change_view', view: SignInView.ERROR });
    }
  };

  const pressEnterAsGuestHandler = async () => {
    try {
      dispatch({ type: 'change_view', view: SignInView.LOADING });
      const newUser = utils.extract({
        authUser: auth.currentUser as firebase.User,
      });
      const created = await userClient.create({
        body: newUser as AnonymouslyUser,
      });
      await userCache.setData(created);

      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: 'MainRootStack' }],
        })
      );
    } catch (error) {
      capture(prefix, 'Press enter as guest handler error', error);
      dispatch({ type: 'change_view', view: SignInView.ERROR });
    }
  };

  const retryHandler = () => {
    dispatch({ type: 'change_view', view: SignInView.SIGN_IN_FORM });
  };

  // render logic
  if (state.view === SignInView.ERROR) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.white,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ErrorView onRetry={retryHandler} />
      </View>
    );
  }

  if (state.view === SignInView.LOADING) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.white,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Loading />
      </View>
    );
  }

  let linkButton = null;
  if (state.view === SignInView.LINK_FORM) {
    switch (state.linkFormInfo?.singInMethod) {
      default:
        linkButton = (
          <ButtonGoogle
            onOK={({ credential }) => {
              signInOkHandler({
                credential,
                credentialToLink: state.linkFormInfo?.credentialToLink,
              });
            }}
          />
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
        <View style={{ height: '40%' }} />
        <Text level={3} weight="bold" style={{ paddingBottom: 30 }}>
          Vinculación de cuentas
        </Text>
        <Text level={6} numberOfLines={2} style={{ paddingBottom: 20 }}>
          Ya habías creado una cuenta anteriormente. Entra con Google para una
          correcta vinculación
        </Text>
        {linkButton}
      </View>
    );
  }

  let guestButton: ReactNode | null = (
    <Button
      title="Ingresar como invitado"
      type="link"
      onPress={pressEnterAsGuestHandler}
      style={{ marginBottom: 30 }}
    />
  );
  if (dont_allow_guest) {
    guestButton = null;
  }
  let title = '¡Bienvenido!';
  let subtitle = 'Inicia sesión con tus redes sociales';
  if (reason === 'to_buy') {
    title = '¡Hola!';
    subtitle = 'Crea una cuenta para comprar y ser parte de nuestra comunidad.';
  } else if (reason === 'to_sell') {
    title = '¡Hola!';
    subtitle = 'Crea una cuenta para vender y ser parte de nuestra comunidad.';
  }
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: colors.white,
          paddingBottom: insets.bottom,
        },
        globalStyles.withPadding,
      ]}
    >
      <View style={{ flexDirection: 'row', marginBottom: 20 }} />
      <BagLogoBackgroundBlue />
      <Text level={1} weight="bold" style={{ marginBottom: 15, marginTop: 10 }}>
        {title}
      </Text>
      <Text
        level={5}
        weight="light"
        style={{ marginBottom: 50, lineHeight: 23 }}
      >
        {subtitle}
      </Text>
      <View style={{ marginBottom: 25 }} />
      <ButtonGoogle onOK={signInOkHandler} />
      <View style={{ marginBottom: 15 }} />
      {Platform.OS !== 'ios' && (
        <>
          <ButtonFacebook onOK={signInOkHandler} />
          <View style={{ marginBottom: 15 }} />
        </>
      )}
      <ButtonApple onOK={signInOkHandler} />
      <View style={{ flex: 1 }} />
      {guestButton}
    </View>
  );
};
