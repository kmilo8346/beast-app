import { useEffect } from 'react';

// containers
import UserProvider from '../../containers/user';

export interface Props {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: Props) => {
  const { redirect } = route.params;
  const userContainer = UserProvider.useContainer();
  const user = userContainer.getUser();
  const currentAddress = userContainer.getCurrentAddress();

  // event handlers
  useEffect(() => {
    console.log('user used to take desition', user);
    if (!userContainer.isLogged()) {
      navigation.replace('SignIn', {
        redirect: {
          name: 'SignInFlow',
          params: route.params,
        },
      });
    } else if (!user?.phone) {
      navigation.replace('SetPhone', {
        redirect: {
          name: 'SignInFlow',
          params: route.params,
        },
      });
    } else if (!user?.phoneVerified) {
      navigation.replace('VerifyPhone', {
        redirect: {
          name: 'SignInFlow',
          params: route.params,
        },
      });
    } else if (!currentAddress) {
      navigation.replace('SetAddress', {
        redirect: {
          name: 'SignInFlow',
          params: route.params,
        },
      });
    } else {
      navigation.replace(redirect.name, redirect.params);
    }
  }, []);

  return null;
};
