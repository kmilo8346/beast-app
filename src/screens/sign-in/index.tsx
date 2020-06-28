import React, { useReducer } from 'react';
import { View, ActivityIndicator } from 'react-native';

// components
import { Container, Text } from '../../components';
// local components
import { ButtonGoogle, ButtonFacebook } from './components';
// libs
import firebase from '../../lib/firebase';
// containes
import UserProvider from '../../containers/user';
import colors from '../../styles/colors';

// instances outside component
const auth = firebase.auth();

type SetLoadingViewAction = {
  type: 'set_loading';
};
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
type Action = SetLoadingViewAction | SetHasErrorAction | ShowLinkFormAction;

type ViewState = 'LOADING' | 'SIGN_IN_FORM' | 'LINK_FORM';
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
    case 'set_loading':
      return {
        ...state,
        hasError: false,
        view: 'LOADING',
      };
    case 'set_has_error':
      return {
        ...state,
        hasError: action.hasError,
        view: state.view === 'LOADING' ? 'SIGN_IN_FORM' : state.view,
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
      dispatch({ type: 'set_loading' });

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
    case 'LOADING':
      content = (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="small" color={colors.black} />
        </View>
      );
      break;
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
        <View>
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
      break;

    default:
      content = (
        <View style={{ marginTop: '40%' }}>
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
          {errorMessage}
        </View>
      );
      break;
  }
  if (state.hasError) {
    errorMessage = (
      <Text level={7} color="red" style={{ marginTop: 20 }}>
        Ocurrió un error inesperado
      </Text>
    );
  }

  return (
    <Container withMargin>
      {content}
      {errorMessage}
    </Container>
  );
};
