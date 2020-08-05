import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';

// libs
import firebase from '../lib/firebase';
// types
import { User } from '../types';

const auth = firebase.auth();
const db = firebase.firestore();

export interface UserContainer {
  get(): User;
}

export default createContainer<UserContainer, User>(
  (initialState): UserContainer => {
    const [authUser, setAuthUser] = useState<firebase.User | null>(null);
    const [user, setUser] = useState<User>(initialState as User);

    // real time update for auth user
    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
        setAuthUser(authUser);
      });

      return () => {
        unsubscribe();
      };
    }, []);

    // real time update for firestore user
    useEffect(() => {
      let unsubscribe: () => void = () => null;
      if (authUser) {
        unsubscribe = db
          .collection('users')
          .doc(authUser.uid)
          .onSnapshot((doc) => {
            const user: User | undefined = doc.data() as User;
            if (!user) {
              // avoid to save undefined user
              // in signin user is undefined for a moment
              return;
            }

            setUser(user);
          });
      }

      return () => {
        unsubscribe();
      };
    }, [authUser]);

    return {
      get,
    };

    function get() {
      return user;
    }
  }
);
