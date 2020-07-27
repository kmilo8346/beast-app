import { useEffect } from 'react';
import { createContainer } from 'unstated-next';

// containers
import useContainer from './container';
import UserProvider from './user';
// libs
import firebase from '../lib/firebase';
import { Order } from '../types';

const STORAGE_KEY = 'order';
const COLLECTION = 'orders';
const PREFIX = '[order container]';
const db = firebase.firestore();

export interface OrderContainer {
  withPaymentPending: () => Order[];
  withDeliveryPending: () => Order[];
}

export default createContainer(
  (): OrderContainer => {
    const container = useContainer<{ [key: string]: any }>(STORAGE_KEY, {});
    const userContainer = UserProvider.useContainer();
    const user = userContainer.getUser();

    // real time updates
    useEffect(() => {
      let unsubscribe1: () => void = () => null;
      let unsubscribe2: () => void = () => null;
      if (user?.id) {
        // listening for orders with payment pending
        unsubscribe1 = db
          .collection(COLLECTION)
          .where('customer.id', '==', user.id)
          .where('status', 'in', ['payment_pending', 'payment_in_process'])
          .onSnapshot(
            (querySnapshot) => {
              const withPaymentPending: any[] = [];
              querySnapshot.forEach((doc) => {
                withPaymentPending.push(doc.data());
              });
              container.set('withPaymentPending', withPaymentPending);
            },
            (error) => {
              console.log(
                `${PREFIX} error listening realtime updates from firestore`,
                error
              );
            }
          );

        // listening for orders pending
        unsubscribe2 = db
          .collection(COLLECTION)
          .where('customer.id', '==', user.id)
          .where('status', 'in', ['confirmation_pending', 'in_delivery'])
          .onSnapshot(
            (querySnapshot) => {
              const withDeliveryPending: any[] = [];
              querySnapshot.forEach((doc) => {
                withDeliveryPending.push(doc.data());
              });
              container.set('withDeliveryPending', withDeliveryPending);
            },
            (error) => {
              console.log(
                `${PREFIX} error listening realtime updates from firestore`,
                error
              );
            }
          );
      }

      return () => {
        unsubscribe1();
        unsubscribe2();
      };
    }, [user?.id]);

    return {
      withPaymentPending,
      withDeliveryPending,
    };

    function withPaymentPending() {
      return container.get('withPaymentPending');
    }

    function withDeliveryPending() {
      return container.get('withDeliveryPending');
    }
  }
);
