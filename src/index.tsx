import React from 'react';
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
const prefix = '[beast]';
const auth = firebase.auth();

interface State {
  has_error: boolean;
}

class App extends React.Component<{}, State> {
  private unsubscribe: () => void;

  constructor(props: any) {
    super(props);
    this.state = {
      has_error: false,
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
        // this.setState({ user_id: authUser.uid });
        deviceAgent.sync({ user_id: authUser.uid });

        const socket = io(Constants.manifest.extra.BEAST_API_URL);
        socket.on('connect', async () => {
          console.log(`${prefix} Socket client connected`);
          const orderInProgressCache = await ordersInProgressCacheManager.get(
            authUser.uid
          );
          console.log(`${prefix} Syncing orders for (inProgressCache)`);
          await orderInProgressCache.sync();

          console.log(
            `${prefix} Start listening orders changes for user: ${authUser.uid}`
          );
          socket.on(authUser.uid, (order: Order) => {
            orderInProgressCache.add([order]);
          });
        });

        socket.on('disconnect', (reason: string) => {
          console.log(
            `${prefix} Socket client disconnected, reason: ${reason}`
          );
        });
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentDidCatch = (error: any, errorInfo: any) => {
    // You can also log the error to an error reporting service
    console.log(`Unexpected error`, error, errorInfo);
  };

  retryHandler = () => {
    this.setState({ has_error: false });
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
