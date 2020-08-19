import React, { useReducer, useEffect } from 'react';
import { View } from 'react-native';

// components
import { Loading, ErrorView } from '../../components';
// clients
import userClient from '../../clients/user-client-v2';
// cache
import userCache from '../../cache/user';
// libs
import firebase from '../../lib/firebase';
import * as utils from '../../lib/utils';
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
    console.log(' ');
    if (userCache.isLogged()) {
      const user = userCache.getData() as LoggedUser;

      console.log('Active user is logged');
      console.log(`User id              :     ${user.id}`);
      console.log(`User email           :     ${user.email}`);
      console.log(`User first name      :     ${user.first_name}`);
      console.log(`User last name       :     ${user.last_name}`);
      console.log(`User photo           :     ${user.photo_url}`);
      console.log(`User phone           :     ${user.phone}`);
      console.log(`User phone verified  :     ${user.phone_verified}`);
      console.log(`User current address :     ${user.current_address}`);
      console.log(`User addresses       :     ${user.addresses}`);
      console.log(`User current store   :     ${user.current_store}`);
      console.log(`User created at      :     ${user.created_at}`);
      console.log(`User updated at      :     ${user.updated_at}`);
    } else {
      const user = userCache.getData() as LoggedUser;

      console.log('Anonymously user');
      console.log(`User id              :     ${user.id}`);
      console.log(`User current address :     ${user.current_address || ''}`);
      console.log(`User created at      :     ${user.created_at || ''}`);
      console.log(`User updated at      :     ${user.updated_at || ''}`);
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
      if (error.response.status === 404) {
        const cache = userCache.getData();
        if (!cache || cache.id !== authUser.uid) {
          await userCache.replaceData(utils.extract(authUser));
        }
        printUserInfo();
        if (userCache.isLogged()) {
          const user = userCache.getData() as LoggedUser;
          if (!user.phone || !user.phone_verified) {
            navigation.replace('SetPhone');
          } else {
            navigation.replace('SetAddress');
          }
        } else {
          navigation.replace('Onboarding');
        }
        return;
      }

      // TODO: log error
      console.log(error);

      dispatch({ type: 'change_view', view: BootView.ERROR });
    }
  };

  const boot = async () => {
    const authUser = auth.currentUser;
    if (!authUser) {
      throw new Error(`${prefix} Auth user must be defined to boot shop shop`);
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
      <Loading message="Conectando con la fuerza" />
    </View>
  );
};
