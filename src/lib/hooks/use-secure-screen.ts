import { useEffect } from 'react';

// containers
import UserProvider from '../../containers/user';

export default (
  navigation: any,
  redirect: { name: string; params?: Record<string, any> }
): void => {
  const userContainer = UserProvider.useContainer();
  const user = userContainer.getUser();

  useEffect(() => {
    if (!user || !user.email) {
      navigation.replace('SignIn', { redirect });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
};
