import React from 'react';

import registerRootComponent from 'expo/build/launch/registerRootComponent';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';

import Navigation from './navigation';
// components
import ErrorView from './components/error-view';
// libs
import firebase from './lib/firebase';
import * as utils from './lib/utils';
import deviceAgent from './lib/device-agent';
// cache
import ordersInProgressCacheManager from './cache/orders-in-progress-cache-manager';
// fonts
const MonserratBold = require('../assets/fonts/monserrat/bold.ttf');
const MonserratNormal = require('../assets/fonts/monserrat/normal.ttf');
const MonserratLight = require('../assets/fonts/monserrat/light.ttf');

// instances outside component
const prefix = '[beast]';
const auth = firebase.auth();

interface State {
  is_ready: boolean;
  has_error: boolean;
}

class App extends React.Component<{}, State> {
  private unsubscribe: () => void;

  constructor(props: any) {
    super(props);
    this.state = {
      is_ready: false,
      has_error: false,
    };
    this.unsubscribe = utils.noop;
  }

  static getDerivedStateFromError = () => {
    // Update state so the next render will show the fallback UI.
    return { has_error: true };
  };

  componentDidMount = () => {
    this.unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        deviceAgent.sync({ user_id: authUser.uid });

        const orderInProgressCache = await ordersInProgressCacheManager.get(
          authUser.uid
        );
        orderInProgressCache.startListening();
      }
    });
  };

  componentWillUnmount = () => {
    this.unsubscribe();
  };

  componentDidCatch = (error: any, errorInfo: any) => {
    // You can also log the error to an error reporting service
    console.log(`Unexpected error`, error, errorInfo);
  };

  retryHandler = () => {
    this.setState({ has_error: false });
  };

  appLoadingStartHandler = async () => {
    console.info(`${prefix} Preloading assets`);
    this.setState({ is_ready: false });
    // tasks
    await this.cacheFont();
  };

  appLoadingErrorHandler = (error: Error) => {
    // TODO: manage errors
    console.log(`${prefix} Preloading error: ${error}`);
  };

  appLoadingFinishHandler = () => {
    this.setState({ is_ready: true });
    console.info(`${prefix} Preloading finished`);
  };

  cacheFont = async () => {
    await Font.loadAsync({
      MonserratBold,
      MonserratNormal,
      MonserratLight,
    });
  };

  render() {
    const { has_error, is_ready } = this.state;

    if (has_error) {
      return <ErrorView onRetry={this.retryHandler} />;
    }

    if (!is_ready) {
      return (
        <AppLoading
          startAsync={this.appLoadingStartHandler}
          onFinish={this.appLoadingFinishHandler}
          onError={this.appLoadingErrorHandler}
        />
      );
    }

    return <Navigation />;
  }
}

export default registerRootComponent(App);
