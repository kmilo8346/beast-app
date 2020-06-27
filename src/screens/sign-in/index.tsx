import React, { useReducer } from 'react';
import { View } from 'react-native';

// components
import { Container, Text } from '../../components';
// local components
import { ButtonGoogle, ButtonFacebook } from './components';
// libs
import firebase from '../../lib/firebase';
// containes
import UserProvider from '../../containers/user';

// instances outside component
const auth = firebase.auth();

type SetHasErrorAction = {
  type: 'set_has_error';
  hasError: boolean;
};
type ShowLinkFormAction = {
  type: 'set_link_form';
  info: {
    singInMethod: string;
    credentialToLink: firebase.auth.OAuthCredential;
  };
};
type Action = SetHasErrorAction | ShowLinkFormAction;

type ViewState = 'SIGN_IN_FORM' | 'LINK_FORM';
type State = {
  view: ViewState;
  linkFormInfo: {
    singInMethod: string;
    credentialToLink: firebase.auth.OAuthCredential;
  } | null;
  hasError: boolean;
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_has_error':
      return {
        ...state,
        hasError: action.hasError,
      };
    case 'set_link_form':
      return {
        ...state,
        view: 'LINK_FORM',
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
  const [state, dispatch] = useReducer(reducer, {
    view: 'SIGN_IN_FORM',
    linkFormInfo: null,
    hasError: false,
  });
  const { redirect } = route.params;
  const userContainer = UserProvider.useContainer();

  // event handlers
  const signInWithProviderOkHandler = async (
    credential: firebase.auth.OAuthCredential,
    credentialToLink?: firebase.auth.OAuthCredential
  ) => {
    try {
      dispatch({ type: 'set_has_error', hasError: false });

      await userContainer.signInWithCredential(credential);

      if (credentialToLink) {
        // linking current auth user with credential to link
        await auth.currentUser?.linkWithCredential(credentialToLink);
      }
      navigation.replace(redirect.name, redirect.params);
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
      dispatch({ type: 'set_has_error', hasError: true });
    }
  };
  const signInWithProviderFailHandler = () => {
    dispatch({ type: 'set_has_error', hasError: true });
  };

  // render logic
  let content = null;
  let errorMessage = null;
  let linkButton = null;
  switch (state.view) {
    case 'LINK_FORM':
      switch (state.linkFormInfo?.singInMethod) {
        case 'facebook.com':
          linkButton = (
            <ButtonFacebook
              onOK={(credential) => {
                signInWithProviderOkHandler(
                  credential,
                  state.linkFormInfo?.credentialToLink
                );
              }}
              onFail={signInWithProviderFailHandler}
            />
          );
          break;

        default:
          linkButton = (
            <ButtonGoogle
              onOK={(credential) => {
                signInWithProviderOkHandler(
                  credential,
                  state.linkFormInfo?.credentialToLink
                );
              }}
              onFail={signInWithProviderFailHandler}
            />
          );
          break;
      }
      content = (
        <>
          <Text level={3} weight="bold" style={{ marginBottom: 30 }}>
            Vinculación de cuentas
          </Text>
          <Text level={6} numberOfLines={2} style={{ marginBottom: 20 }}>
            {`Ya habías creado una cuenta anteriormente. Entra con ${state.linkFormInfo?.singInMethod} para una correcta vinculación`}
          </Text>
          {linkButton}
        </>
      );
      break;

    default:
      content = (
        <>
          <Text level={3} weight="bold" style={{ marginBottom: 10 }}>
            !Hola¡
          </Text>
          <Text level={6} style={{ marginBottom: 20 }}>
            Inicia sessión para continuar
          </Text>
          <ButtonGoogle
            onOK={signInWithProviderOkHandler}
            onFail={signInWithProviderFailHandler}
          />
          <View style={{ marginBottom: 10 }} />
          <ButtonFacebook
            onOK={signInWithProviderOkHandler}
            onFail={signInWithProviderFailHandler}
          />
        </>
      );
      break;
  }
  if (state.hasError) {
    if (state.hasError) {
      errorMessage = (
        <Text level={7} color="red" style={{ marginTop: 20 }}>
          Ocurrió un error inesperado
        </Text>
      );
    }
  }
  return (
    <Container withMargin>
      <View style={{ marginTop: '40%' }}>{content}</View>
      {errorMessage}
    </Container>
  );
};
