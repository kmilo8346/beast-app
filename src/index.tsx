import React from 'react';
import registerRootComponent from 'expo/build/launch/registerRootComponent';

import Boot from './boot';
import UserContainer from './containers/user';
import CartContainer from './containers/cart';

function App() {
  return (
    <UserContainer.Provider>
      <CartContainer.Provider>
        <Boot />
      </CartContainer.Provider>
    </UserContainer.Provider>
  );
}

export default registerRootComponent(App);
