import React from 'react';
import { StatusBar, View, LogBox } from 'react-native';
import registerRootComponent from 'expo/build/launch/registerRootComponent';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';

import Navigation from './navigation/index';
// components
import ErrorView from './components/error-view';
// clients
import userClient from './clients/user-client';
import deviceClient, { getDeviceData } from './clients/device-client';
// libs
import firebase from './lib/firebase';
import { capture } from './lib/sentry';
// cache
import userCache from './cache/user';
import genericCache from './cache/generic';
import shoppingCartCache from './cache/shopping-cart';
// fonts
const MonserratBold = require('../assets/fonts/monserrat/bold.ttf');
const MonserratNormal = require('../assets/fonts/monserrat/normal.ttf');
const MonserratLight = require('../assets/fonts/monserrat/light.ttf');
const fontello = require('../assets/fonts/fontello/fontello.ttf');

LogBox.ignoreLogs(['Setting a timer']);

// instances outside component
const prefix = '[beast]';
const auth = firebase.auth();

interface State {
  is_ready: boolean;
  has_error: boolean;
}

class App extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      is_ready: false,
      has_error: false,
    };
  }

  static getDerivedStateFromError = () => {
    // Update state so the next render will show the fallback UI.
    return { has_error: true };
  };

  componentDidCatch = (error: any) => {
    capture(prefix, 'Unexpected error', error);
  };

  initAuth = async () => {
    return new Promise((resolve, reject) => {
      auth.onAuthStateChanged((authUser) => {
        if (!authUser) {
          auth.signInAnonymously().catch((error) => {
            capture(prefix, 'Init auth error', error);
            reject(error);
          });
        } else {
          resolve(authUser);
        }
      });
    });
  };

  initUser = async () => {
    await userCache.load();
    const cache = userCache.getData();

    if (!cache?.id) {
      return;
    }

    try {
      const user = await userClient.get({ pathVars: { id: cache.id } });
      userCache.setData(user);
    } catch (error) {
      if (error.response?.status === 404) {
        capture(prefix, 'Init user error', error);
        userCache.resetData();
        return;
      }
      console.warn(
        `${prefix} Fresh user cant be resolved, using cache instead`
      );
    }
  };

  initDevice = async () => {
    if (!genericCache.getDeviceId()) {
      try {
        const data = await getDeviceData();
        const device = await deviceClient.create({
          body: data,
          source: ['id'],
        });
        await genericCache.updateData({ device_id: device.id });
      } catch (error) {
        capture(prefix, 'Init device error', error);
      }
    }
  };

  cacheFont = async () => {
    await Font.loadAsync({
      MonserratBold,
      MonserratNormal,
      MonserratLight,
      fontello,
    });
  };

  retryHandler = () => {
    this.setState({ has_error: false });
  };

  appLoadingStartHandler = async () => {
    this.setState({ is_ready: false });
    // tasks
    await this.initAuth();
    await Promise.all([
      this.cacheFont(),
      genericCache.load(),
      shoppingCartCache.load(),
      this.initUser(),
    ]);

    await this.initDevice();
  };

  appLoadingErrorHandler = (error: Error) => {
    capture(prefix, 'App loading handler error', error);
  };

  appLoadingFinishHandler = () => {
    this.setState({ is_ready: true });
  };

  render() {
    const { has_error, is_ready } = this.state;

    if (has_error) {
      return (
        <View style={{ flex: 1 }}>
          <StatusBar backgroundColor="white" barStyle="dark-content" />
          <ErrorView onRetry={this.retryHandler} />
        </View>
      );
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

    return (
      <View style={{ flex: 1 }}>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <Navigation />
      </View>
    );
  }
}

export default registerRootComponent(App);
