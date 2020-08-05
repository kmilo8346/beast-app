import React, { useReducer, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import validate from 'validate.js';

// components
import { Container, Text, Input, Button } from '../../components';
// local components
import { ButtonGoogle, ButtonFacebook } from './components';
// clients
import userClient from '../../clients/user-client';
// libs
import firebase from '../../lib/firebase';
// constraints
import constraints from './constraints';
// containers
import UserProvider from '../../containers/user';
// styles
import colors from '../../styles/colors';

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
  opId: string;
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
    submitOpId?: string;
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
  // state
  const [state, dispatch] = useReducer(reducer, {
    view: 'SIGN_IN_FORM',
    form: {
      email: '',
      submitted: false,
    },
    linkFormInfo: null,
  });
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();

  // preconditions
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }

  // event handlers
  const signInWithProviderOkHandler = async (
    credential: firebase.auth.OAuthCredential,
    credentialToLink?: firebase.auth.OAuthCredential
  ) => {
    try {
      dispatch({ type: 'show_loading' });
      const prevUserData = user;
      const prevAuthUser = auth.currentUser;
      const opId = `${new Date().getTime()}`;
      await userClient.signIn(credential, prevUserData, opId);

      try {
        // clean logic
        await Promise.all([
          userClient.delete(prevUserData.id),
          prevAuthUser?.delete(),
        ]);
      } catch (error) {
        // dont crash app for that
      }

      if (!auth.currentUser) {
        throw new Error(
          `${prefix} Auth user must be defined after a sucefull signin`
        );
      }

      if (credentialToLink) {
        // linking current auth user with credential to link
        await auth.currentUser.linkWithCredential(credentialToLink);
      }
      dispatch({ type: 'set_submit_op_id', opId });
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
  const signInWithProviderFailHandler = () => {
    dispatch({ type: 'show_error' });
  };
  const changeEmailHandler = (email: string) => {
    dispatch({ type: 'change_email', email });
  };
  const submitHandler = () => {
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      return;
    }
    // TODO: implement signInWithEmail
    console.log('signInWithEmail');
  };
  useEffect(() => {
    if (user && user.email && user.opId === state.form.submitOpId) {
      // not phone
      if (!user.phone || !user.phoneVerified) {
        navigation.replace('SetPhone', route.params);
        return;
      }
      // not current address
      if (!user.currentAddress) {
        navigation.navigate('SetAddress');
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
      navigation.replace(route.params.redirect.name);
    }
  }, [state.form.submitOpId, user]);

  // render logic
  let content = null;
  let linkButton = null;
  switch (state.view) {
    case 'LOADING':
      content = (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="small" color={colors.black} />
          <Text level={7}>Conectándonos a la Matrix</Text>
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
        <View>
          <Text
            level={1}
            weight="bold"
            style={{ marginBottom: 35, color: colors.blue }}
          >
            Logo
          </Text>
          <Text level={1} weight="bold" style={{ marginBottom: 15 }}>
            !Hola¡
          </Text>
          <Text level={5} style={{ marginBottom: 50 }}>
            Para empezar ingresa con tu email
          </Text>
          <Input
            placeholder="Email"
            label=""
            returnKeyType="done"
            onSubmitEditing={submitHandler}
            value={state.form.email}
            errors={state.form.errors?.email}
            onChangeText={changeEmailHandler}
            containerStyle={{ marginBottom: 30 }}
          />
          <Button
            title="Continuar"
            onPress={submitHandler}
            style={{ marginBottom: 15 }}
          />
          <ButtonGoogle
            onOK={signInWithProviderOkHandler}
            onFail={signInWithProviderFailHandler}
          />
          <View style={{ marginBottom: 15 }} />
          <ButtonFacebook
            onOK={signInWithProviderOkHandler}
            onFail={signInWithProviderFailHandler}
          />
        </View>
      );
      break;
  }

  return <Container withMargin>{content}</Container>;
};
