import React from 'react';
import { View } from 'react-native';
import registerRootComponent from 'expo/build/launch/registerRootComponent';

import Boot from './boot';
// components
import { ErrorView, Loading } from './components';
// containers
import UserContainer from './containers/user';
import CartContainer from './containers/cart';
import OrderContainer from './containers/order';
// libs
import firebase from './lib/firebase';
import { noop } from './lib/utils';
// types
import { User } from './types';
// clients
import userClient from './clients/user-client';

const prefix = '[app]';
const auth = firebase.auth();

interface State {
  hasError: boolean;
  hydrated: boolean;
  user?: User;
}

class App extends React.Component<{}, State> {
  private unsubAuth: () => void = noop;

  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      hydrated: false,
    };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidMount() {
    this.unsubAuth = auth.onAuthStateChanged(async (authUser) => {
      const { hydrated } = this.state;
      if (!hydrated || !authUser) {
        this.hydrate();
      }
    });
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.log(`Unexpected error`, error, errorInfo);
  }

  componentWillUnmount() {
    this.unsubAuth();
  }

  async hydrate() {
    this.setState({ hydrated: false });
    if (!auth.currentUser) {
      const credentials = await auth.signInAnonymously();
      if (!credentials.user) {
        throw new Error(
          `${prefix} Invalid user after sucefull anonymously sign in`
        );
      }
      await userClient.create(credentials.user);
    }
    if (!auth.currentUser) {
      throw new Error(`${prefix} Current user must be defined`);
    }
    const user = await userClient.get(auth.currentUser.uid);
    if (!user) {
      await userClient.create(auth.currentUser);
    }
    this.setState({ hydrated: true, user });
  }

  render() {
    const { hasError, hydrated, user } = this.state;

    if (hasError) {
      return (
        <ErrorView
          onRetry={() => {
            this.hydrate();
          }}
        />
      );
    }

    if (!hydrated) {
      return (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Loading message="Conectando con la fuerza" />
        </View>
      );
    }

    console.log('Current user', user?.id);
    return (
      <UserContainer.Provider initialState={user}>
        <CartContainer.Provider>
          <OrderContainer.Provider>
            <Boot />
          </OrderContainer.Provider>
        </CartContainer.Provider>
      </UserContainer.Provider>
    );
  }
}

export default registerRootComponent(App);
