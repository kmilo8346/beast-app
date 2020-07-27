import React from 'react';
import { YellowBox } from 'react-native';
import registerRootComponent from 'expo/build/launch/registerRootComponent';

import Boot from './boot';
// component
import { ErrorView } from './components';
// containers
import UserContainer from './containers/user';
import CartContainer from './containers/cart';
import OrderContainer from './containers/order';

// CreateOrUpdateProduct and CreateOrUpdateService using function in params
// @site https://reactnavigation.org/docs/troubleshooting/#i-get-the-warning-non-serializable-values-were-found-in-the-navigation-state
YellowBox.ignoreWarnings([
  'Non-serializable values were found in the navigation state',
]);

class App extends React.Component<{}, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.log(`Unexpected error`, error, errorInfo);
  }

  render() {
    const { hasError } = this.state;
    if (hasError) {
      // You can render any custom fallback UI
      return (
        <ErrorView
          onRetry={() => {
            this.setState({ hasError: false });
          }}
        />
      );
    }
    return (
      <UserContainer.Provider>
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
