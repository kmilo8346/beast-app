import React from 'react';

import registerRootComponent from 'expo/build/launch/registerRootComponent';

import Navigation from './navigation';
// components
import { ErrorView } from './components';
// containers
import UserContainer from './containers/user';
import CartContainer from './containers/cart';
import OrderContainer from './containers/order';

interface State {
  has_error: boolean;
}

class App extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      has_error: false,
    };
  }

  static getDerivedStateFromError = () => {
    // Update state so the next render will show the fallback UI.
    return { has_error: true };
  };

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

    return (
      <UserContainer.Provider>
        <CartContainer.Provider>
          <OrderContainer.Provider>
            <Navigation />
          </OrderContainer.Provider>
        </CartContainer.Provider>
      </UserContainer.Provider>
    );
  }
}

export default registerRootComponent(App);
