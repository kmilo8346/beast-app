import { useEffect } from 'react';

// libs
import firebase from '../firebase';

export default (
  navigation: any,
  redirect: { name: string; params?: Record<string, any> }
): void => {
  useEffect(() => {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser || currentUser.isAnonymous) {
      navigation.replace('SignIn', { redirect });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
