import React from 'react';
import { AppState, AppStateStatus } from 'react-native';
import io from 'socket.io-client';
import Constants from 'expo-constants';

import registerRootComponent from 'expo/build/launch/registerRootComponent';

import Navigation from './navigation';
// components
import ErrorView from './components/error-view';
// libs
import firebase from './lib/firebase';
import * as utils from './lib/utils';
import deviceAgent from './lib/device-agent';
// cache
import ordersInProgressCacheManager from './cache/orders-in-progress-cache-manager';
// types
import { Order } from './types';

// instances outside component
const auth = firebase.auth();
const socket = io(Constants.manifest.extra.BEAST_API_URL);

interface State {
  has_error: boolean;
  user_id?: string;
  state: AppStateStatus;
}

class App extends React.Component<{}, State> {
  private unsubscribe: () => void;

  constructor(props: any) {
    super(props);
    this.state = {
      has_error: false,
      state: AppState.currentState,
    };
    this.unsubscribe = utils.noop;
  }

  static getDerivedStateFromError = () => {
    // Update state so the next render will show the fallback UI.
    return { has_error: true };
  };

  componentDidMount() {
    this.unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        this.setState({ user_id: authUser.uid });
        deviceAgent.sync({ user_id: authUser.uid });
      }
    });

    AppState.addEventListener('change', this.handleAppStateChange);
  }

  async componentDidUpdate(_prevProps: {}, prevState: State) {
    const { user_id, state } = this.state;

    if (user_id !== prevState.user_id || state !== prevState.state) {
      if (user_id && state === 'active') {
        const orderInProgressCache = await ordersInProgressCacheManager.get(
          user_id
        );
        await orderInProgressCache.sync();

        socket.on(user_id, (order: Order) => {
          orderInProgressCache.add([order]);
        });
      }
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  componentDidCatch = (error: any, errorInfo: any) => {
    // You can also log the error to an error reporting service
    console.log(`Unexpected error`, error, errorInfo);
  };

  retryHandler = () => {
    this.setState({ has_error: false });
  };

  handleAppStateChange = (state: AppStateStatus) => {
    this.setState({ state });
  };

  render() {
    const { has_error } = this.state;

    if (has_error) {
      return <ErrorView onRetry={this.retryHandler} />;
    }

    return <Navigation />;
  }
}

export default registerRootComponent(App);
