import React from 'react';
import registerRootComponent from 'expo/build/launch/registerRootComponent';

import Boot from './boot';
import User from './containers/user';

function App() {
  return (
    <User.Provider>
      <Boot />
    </User.Provider>
  );
}

export default registerRootComponent(App);
