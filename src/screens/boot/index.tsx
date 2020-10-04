/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useReducer, useEffect } from 'react';
import { View } from 'react-native';

// components
import Loading from '../../components/loading';
import ErrorView from '../../components/error-view';
// clients
import userClient from '../../clients/user-client';
// cache
import userCache from '../../cache/user';
// libs
import firebase from '../../lib/firebase';
import * as utils from '../../lib/utils';
import { capture } from '../../lib/sentry';
// styles
import colors from '../../styles/colors';
import { LoggedUser } from '../../types';

// instances outside component
const prefix = '[boot screen]';
const auth = firebase.auth();

enum BootView {
  LOADING = 'loading',
  ERROR = 'error',
}
type ChangeViewAction = {
  type: 'change_view';
  view: BootView;
};
type Action = ChangeViewAction;
type State = {
  view: BootView;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_view':
      return { ...state, view: action.view };
    default:
      return state;
  }
};

interface BootProps {
  navigation: any;
}

export default ({ navigation }: BootProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    view: BootView.LOADING,
  });

  // event handlers
  const retryHandler = () => {
    boot();
  };

  const printUserInfo = () => {
    console.log(`${prefix} `);
    if (userCache.isLogged()) {
      const user = userCache.getData() as LoggedUser;

      console.log(`${prefix} Active user is logged`);
      console.log(`${prefix} User id              :     ${user.id}`);
      console.log(`${prefix} User email           :     ${user.email}`);
      console.log(`${prefix} User first name      :     ${user.first_name}`);
      console.log(`${prefix} User last name       :     ${user.last_name}`);
      console.log(`${prefix} User photo           :     ${user.photo_url}`);
      console.log(`${prefix} User phone           :     ${user.phone}`);
      console.log(
        `${prefix} User phone verified  :     ${user.phone_verified}`
      );
      console.log(
        `${prefix} User current address :     ${user.current_address}`
      );
      console.log(`${prefix} User addresses       :     ${user.addresses}`);
      console.log(`${prefix} User current store   :     ${user.current_store}`);
      console.log(`${prefix} User created at      :     ${user.created_at}`);
      console.log(`${prefix} User updated at      :     ${user.updated_at}`);
    } else {
      const user = userCache.getData() as LoggedUser;

      console.log(`${prefix} Anonymously user`);
      console.log(`${prefix} User id              :     ${user.id}`);
      console.log(
        `${prefix} User current address :     ${user.current_address}`
      );
      console.log(`${prefix} User addresses       :     ${user.addresses}`);
      console.log(`${prefix} User created at      :     ${user.created_at}`);
      console.log(`${prefix} User updated at      :     ${user.updated_at}`);
    }
  };

  const fetchUser = async (authUser: firebase.User) => {
    try {
      const user = await userClient.get({
        pathVars: {
          id: authUser.uid,
        },
      });
      await userCache.setData(user);
      printUserInfo();
      navigation.replace('MainTab');
    } catch (error) {
      if (error.response?.status === 404) {
        navigation.replace('Onboarding');
        return;
      }

      capture(prefix, 'Fetch user error', error);

      dispatch({ type: 'change_view', view: BootView.ERROR });
    }
  };

  const boot = async () => {
    dispatch({ type: 'change_view', view: BootView.LOADING });
    const authUser = auth.currentUser;
    if (!authUser) {
      throw new Error(`${prefix} Auth user must be defined to boot beast app`);
    }
    await userCache.load();
    fetchUser(authUser);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (!authUser) {
        await auth.signInAnonymously();
      } else {
        boot();
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // render logic
  if (state.view === BootView.ERROR) {
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
};
