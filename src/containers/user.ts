/* eslint-disable @typescript-eslint/no-use-before-define */
import { createContainer } from 'unstated-next';
import { useEffect } from 'react';

// container
import useContainer from './container';
// libs
import firebase from '../lib/firebase';
// clients
import customerClient from '../clients/customer-client';
// types
import { Place, User, Card } from '../types';

const STORAGE_KEY = 'user';
const COLLECTION = 'users';
const PREFIX = '[user container]';
const auth = firebase.auth();
const db = firebase.firestore();

export interface UserContainer {
  // user
  getUser: () => User | null;
  setUser: (user: User) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signInWithCredential: (
    credential: firebase.auth.AuthCredential
  ) => Promise<void>;
  signOut: () => Promise<void>;

  // addresses
  getCurrentAddress: () => string | null;
  getAddresses: () => Place[];
  setCurrentAddress: (addressId: string) => Promise<void>;
  addAddress: (newAddress: Place) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;

  getCurrentCard: () => string | null | undefined;
  getCards: () => Card[];
  setCurrentCard: (cardId: string | null) => Promise<void>;
  addCard: (card: Card) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
}

export default createContainer(
  (): UserContainer => {
    const container = useContainer(STORAGE_KEY, null);
    const user = getUser();
    const id = user ? user.id : null;

    // real time update for auth user
    useEffect(() => {
      const subscribe = auth.onAuthStateChanged(async (authUser) => {
        if (!authUser) {
          // if not user create a anonymously user
          try {
            await signInAnonymously();
          } catch (error) {
            // TODO: manage error
          }
        } else {
          // use this to fix fails
          container.set('id', authUser.uid);
        }
      });
      return () => {
        subscribe();
      };
    }, []);

    // real time update for firestore user
    useEffect(() => {
      let subscribe: () => void = () => null;
      if (id) {
        subscribe = db
          .collection(COLLECTION)
          .doc(id)
          .onSnapshot((doc) => {
            const data = doc.data() || null;
            container.setAll(data);
          });
      }

      return () => {
        subscribe();
      };
    }, [id]);

    return {
      // user
      getUser,
      setUser,
      signInAnonymously,
      signInWithCredential,
      signOut,

      // addresses
      getCurrentAddress,
      getAddresses,
      setCurrentAddress,
      addAddress,
      deleteAddress,

      // cards
      getCurrentCard,
      getCards,
      setCurrentCard,
      addCard,
      deleteCard,
    };

    // user
    function getUser(): User {
      return (container.getAll() as User) || null;
    }

    async function setUser(user: User) {
      try {
        container.setAll(user);
        await db.collection(COLLECTION).doc(user.id).set(user);
      } catch (error) {
        // TODO: log error
        console.log(error);
        throw error;
      }
    }

    async function signInAnonymously() {
      try {
        const userCredential = await auth.signInAnonymously();
        await init(userCredential);
      } catch (error) {
        // TODO: log error
        throw error;
      }
    }

    async function signInWithCredential(
      credential: firebase.auth.AuthCredential
    ) {
      console.info(`${PREFIX} Signin with credential STARTED`);
      // save prev user data to restore if fail the signin
      const prevUserData = getUser();
      // save prev auth user ref
      // to restore if fail the signin and
      // delete anonymous user in firebase authentication
      const prevAuthUser = auth.currentUser;
      console.info(`${PREFIX} Prev user was saved as backup`, prevUserData);
      try {
        // delete current user data to avoid
        // permision issues with firestore
        // beacuse request.auth is going to change
        container.clear();
        console.info(`${PREFIX} User container was clear`);
        try {
          if (prevAuthUser) {
            await db.collection(COLLECTION).doc(prevUserData.id).delete();
            console.info(
              `${PREFIX} User doc ${prevUserData.id} was deleted in firestore`
            );
          }
        } catch (error) {
          // TODO: log error
          // this error is not a real problem
          // if not work a job must clean
        }

        // signin
        const result = await auth.signInWithCredential(credential);
        console.log(`${PREFIX} Sigin in firebase auth was ok`);
        // init
        await init(result, prevUserData);
        console.log(`${PREFIX} User initialization was ok`);

        // clean anonymous data in firebase authentication
        try {
          if (prevAuthUser) {
            await prevAuthUser.delete();
            console.log(
              `${PREFIX} Prev anonymous user was deleted in firebase auth`
            );
          }
        } catch (error) {
          // TODO: log error
          // this error is not a real problem
          // if not work a job must clean
        }
        console.info(`${PREFIX} Signin with credential FINALIZED`);
      } catch (error) {
        // TODO: log error
        console.log(error);
        if (
          (error as firebase.auth.AuthError).code ===
          'auth/account-exists-with-different-credential'
        ) {
          console.log(`${PREFIX} Restoring prev user`);
          await setUser(prevUserData);
          console.log(`${PREFIX} Prev user was restored`);
        }
        // TODO: signin prev user and restore prev user data
        throw error;
      }
    }

    /**
     * Initalize a new signed user
     * New user is created using auth user info
     * this method take care or merge data with prev session
     * @param userCredential
     * @param prevSessionUser
     */
    async function init(
      userCredential: firebase.auth.UserCredential,
      prevSessionUser: User | null = null
    ) {
      try {
        const authUser = userCredential.user;
        if (!authUser) {
          throw new Error('User credential dont have a valid user');
        }

        let user: any;
        if (!userCredential.additionalUserInfo?.isNewUser) {
          // getting already register user data
          const doc = await db.collection(COLLECTION).doc(authUser.uid).get();
          if (doc.exists) {
            user = doc.data();
          }
        }
        if (!user) {
          // create new user
          let firstName = authUser.displayName;
          let lastName = null;
          if (userCredential?.additionalUserInfo?.profile) {
            const profile: any = userCredential.additionalUserInfo.profile;

            if (profile.first_name) {
              firstName = profile.first_name;
            } else if (profile.given_name) {
              firstName = profile.given_name;
            }

            if (profile.last_name) {
              lastName = profile.last_name;
            } else if (profile.family_name) {
              lastName = profile.family_name;
            }
          }
          let customerId = null;
          if (authUser.email) {
            // get customer id if has email
            const { id } = await customerClient.create({
              body: { email: authUser.email },
              source: ['id'],
            });
            customerId = id;
          }
          // set user data from firebase authentication
          // can be a anonymously user too
          user = {
            id: authUser.uid,
            email: authUser.email,
            customerId,
            identificationNumber: null,
            firstName,
            lastName,
            phone: authUser.phoneNumber,
            photoURL: authUser.photoURL,
          };
        }

        // merge with prev session if exist
        if (prevSessionUser) {
          // merge with prev session
          // prev session objects have priority

          // address
          const addressIds = (prevSessionUser.addresses || []).map(
            (address: Place) => address.id
          );
          user.addresses = Array.prototype.concat(
            prevSessionUser.addresses || [],
            (user.addresses || []).filter(
              (address: Place) => addressIds.indexOf(address.id) === -1
            )
          );
          user.currentAddress =
            prevSessionUser.currentAddress || user.currentAddress || null;
        }

        // save data in firestore
        await db.collection(COLLECTION).doc(user.id).set(user);
        // set user in container to begin to get realtime updates
        container.setAll(user);
      } catch (error) {
        // TODO: manage error
        console.log(error);
      }
    }

    async function signOut() {
      try {
        container.clear();
        await auth.signOut();
      } catch (error) {
        // TODO: log error
        throw error;
      }
    }

    // addresses
    function getCurrentAddress(): string | null {
      return container.get('currentAddress') || null;
    }

    function getAddresses(): Place[] {
      return container.get('addresses') || [];
    }

    function setCurrentAddress(addressId: string): Promise<void> {
      if (!user) {
        throw new Error('User is not defined');
      }
      return db.collection(COLLECTION).doc(user.id).update({
        currentAddress: addressId,
      });
    }

    function addAddress(newAddress: Place): Promise<void> {
      if (!user) {
        throw new Error('User is not defined');
      }

      let found = false;
      let currentAddress = getCurrentAddress();
      const addresses = getAddresses().map((address) => {
        if (address.id === newAddress.id) {
          found = true;
          return newAddress;
        }
        return address;
      });
      if (!found) {
        addresses.push(newAddress);
        currentAddress = newAddress.id;
      }

      return db.collection(COLLECTION).doc(user.id).update({
        currentAddress,
        addresses,
      });
    }

    function deleteAddress(id: string): Promise<void> {
      if (!user) {
        throw new Error('User is not defined');
      }
      let addresses = getAddresses();
      addresses = addresses.filter((address) => address.id !== id);
      let currentAddress = getCurrentAddress();
      if (currentAddress === id && addresses.length) {
        currentAddress = addresses[0].id;
      }
      return db.collection(COLLECTION).doc(user.id).update({
        currentAddress,
        addresses,
      });
    }

    // cards
    function getCurrentCard(): string | null | undefined {
      return container.get('currentCard');
    }

    function getCards(): Card[] {
      return container.get('cards') || [];
    }

    function setCurrentCard(cardId: string | null): Promise<void> {
      if (!user) {
        throw new Error('User is not defined');
      }
      return db.collection(COLLECTION).doc(user.id).update({
        currentCard: cardId,
      });
    }

    function addCard(newCard: Card): Promise<void> {
      if (!user) {
        throw new Error('User is not defined');
      }

      let found = false;
      let currentCard = getCurrentCard();
      const cards = getCards().map((card) => {
        if (card.id === newCard.id) {
          found = true;
          return newCard;
        }
        return card;
      });
      if (!found) {
        cards.push(newCard);
        currentCard = newCard.id;
      }

      return db.collection(COLLECTION).doc(user.id).update({
        currentCard,
        cards,
      });
    }

    function deleteCard(id: string): Promise<void> {
      if (!user) {
        throw new Error('User is not defined');
      }
      let cards = getCards();
      cards = cards.filter((card) => card.id !== id);
      let currentCard = getCurrentCard();
      if (currentCard === id && cards.length) {
        currentCard = cards[0].id;
      }
      return db.collection(COLLECTION).doc(user.id).update({
        currentCard,
        cards,
      });
    }
  }
);
