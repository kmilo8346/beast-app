import React, { useReducer, ReactNode } from 'react';
import { View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import Loading from '../../components/loading';
import Text from '../../components/text';
import Button from '../../components/buttons/button';
import BagLogoBackgroundBlue from '../../components/svgs/images/bag-logo-background-blue';
// local components
import ButtonGoogle from './components/button-google';
import ButtonFacebook from './components/button-facebook';
// clients
import userClient from '../../clients/user-client';
// libs
import firebase from '../../lib/firebase';
import * as utils from '../../lib/utils';
import validate from '../../lib/validate';
// constraints
import constraints from './constraints';
// types
import { User, Place } from '../../types';
// cache
import userCache from '../../cache/user';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[sign in screen]';
const auth = firebase.auth();

type ChangeEmailAction = {
  type: 'change_email';
  email: string;
};
type ValidateEmailAction = {
  type: 'validate_email';
  email: string;
};
type SetFormSubmittedAction = {
  type: 'set_form_submitted';
};
type SetFormErrorsAction = {
  type: 'set_form_errors';
  errors: { [key: string]: string[] };
};
type ShowLoadingAction = {
  type: 'show_loading';
};
type ShowErrorAction = {
  type: 'show_error';
};
type ShowLinkFormAction = {
  type: 'set_link_form';
  info: {
    singInMethod: string;
    credentialToLink: firebase.auth.OAuthCredential;
  };
};
type SetSubmitOpIdAction = {
  type: 'set_submit_op_id';
  opId: number;
};
type Action =
  | ChangeEmailAction
  | ValidateEmailAction
  | SetFormSubmittedAction
  | SetFormErrorsAction
  | ShowLoadingAction
  | ShowErrorAction
  | ShowLinkFormAction
  | SetSubmitOpIdAction;

type ViewState = 'LOADING' | 'SIGN_IN_FORM' | 'LINK_FORM';
type State = {
  view: ViewState;
  form: {
    // fields
    email: string;
    // other states
    submitted: boolean;
    // identify the submit
    submitOpId?: number;
    errors?: { [key: string]: string[] };
  };
  linkFormInfo: {
    singInMethod: string;
    credentialToLink: firebase.auth.OAuthCredential;
  } | null;
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_email':
      return {
        ...state,
        form: { ...state.form, email: action.email },
      };
    case 'validate_email':
      if (!state.form.submitted) return state;

      return {
        ...state,
        form: {
          ...state.form,
          errors: validate.single(state.form.email, constraints.email),
        },
      };
    case 'set_form_submitted':
      return { ...state, form: { ...state.form, submitted: true } };
    case 'set_form_errors':
      return { ...state, form: { ...state.form, errors: action.errors } };
    case 'show_loading':
      return {
        ...state,
        view: 'LOADING',
      };
    case 'show_error':
      return {
        ...state,
        view: 'SIGN_IN_FORM',
      };
    case 'set_link_form':
      return {
        ...state,
        view: 'LINK_FORM',
        linkFormInfo: action.info,
      };
    case 'set_submit_op_id':
      return {
        ...state,
        form: { ...state.form, submitOpId: action.opId },
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
  const redirect = route.params?.redirect || { name: 'MainTab' };
  const dont_allow_guest = route.params.dont_allow_guest;
  // state
  const [state, dispatch] = useReducer(reducer, {
    view: 'SIGN_IN_FORM',
    form: {
      email: '',
      submitted: false,
    },
    linkFormInfo: null,
  });
  const insets = useSafeAreaInsets();

  // event handlers
  const removeAnonymously = async (anonymously: firebase.User | null) => {
    try {
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
      // dont crash app for that
      console.log(
        `${prefix} Unexpected error deleting anonymously user, id: ${anonymously?.uid}`
      );
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
      if (error.response.status !== 404) {
        throw error;
      }
    }
    return user;
  };

  const signInOkHandler = async (
    credential: firebase.auth.OAuthCredential,
    credentialToLink?: firebase.auth.OAuthCredential
  ) => {
    try {
      dispatch({ type: 'show_loading' });
      const prevAuthUser = auth.currentUser;
      const prevUser = userCache.getData();

      const result = await auth.signInWithCredential(credential);
      if (!result.user) {
        throw new Error(
          `${prefix} Auth user must be defined after a successful signin`
        );
      }

      // removing anonymously user
      removeAnonymously(prevAuthUser);

      // linking current auth user with credential to link
      if (credentialToLink) {
        await result.user.linkWithCredential(credentialToLink);
      }

      // init user
      const user = await fetchUser(result.user.uid);
      if (user) {
        await userCache.setData(user);

        // merge
        if (prevUser?.current_address && prevUser.addresses.length) {
          const addressIds = prevUser.addresses.map(
            (address: Place) => address.id
          );
          const addresses = Array.prototype.concat(
            prevUser.addresses,
            user.addresses.filter(
              (address: Place) => addressIds.indexOf(address.id) === -1
            )
          );
          const current_address =
            prevUser.current_address || user.current_address;
          await userClient.update({
            pathVars: { id: user.id },
            body: {
              addresses,
              current_address,
            },
          });
          await userCache.updateData({
            addresses,
            current_address,
          });
        }

        if (redirect.name === 'MainTab') {
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [{ name: 'MainTab' }],
            })
          );
        } else {
          navigation.replace(redirect.name, redirect.params);
        }
      } else {
        const newUser = utils.extract(
          result.user,
          result.additionalUserInfo?.profile || undefined
        );
        await userCache.replaceData(newUser);
        // set address info
        if (prevUser?.current_address && prevUser.addresses.length) {
          await userCache.updateData({
            addresses: prevUser.addresses,
            current_address: prevUser.current_address,
          });
        }
        navigation.replace('SetPhone', { redirect });
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
      dispatch({ type: 'show_error' });
    }
  };

  const signInFailHandler = () => {
    dispatch({ type: 'show_error' });
  };

  const pressEnterAsGuestHandler = () => {
    navigation.replace('SetAddress');
  };

  // render logic
  if (state.view === 'LOADING') {
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
  if (state.view === 'LINK_FORM') {
    switch (state.linkFormInfo?.singInMethod) {
      case 'facebook.com':
        linkButton = (
          <ButtonFacebook
            onOK={(credential) => {
              signInOkHandler(credential, state.linkFormInfo?.credentialToLink);
            }}
            onFail={signInFailHandler}
          />
        );
        break;
      default:
        linkButton = (
          <ButtonGoogle
            onOK={(credential) => {
              signInOkHandler(credential, state.linkFormInfo?.credentialToLink);
            }}
            onFail={signInFailHandler}
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
          {`Ya habías creado una cuenta anteriormente. Entra con ${state.linkFormInfo?.singInMethod} para una correcta vinculación`}
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
        !Bienvenido!
      </Text>
      <Text level={5} weight="200" style={{ marginBottom: 50 }}>
        Inicia sesión con algunos de tus usuarios
      </Text>
      <View style={{ marginBottom: 25 }} />
      <ButtonGoogle onOK={signInOkHandler} onFail={signInFailHandler} />
      <View style={{ marginBottom: 15 }} />
      <ButtonFacebook onOK={signInOkHandler} onFail={signInFailHandler} />
      <View style={{ flex: 1 }} />
      {guestButton}
    </View>
  );
};
