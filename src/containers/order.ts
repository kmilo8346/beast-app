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
  list: (filter: (order: Order) => boolean) => Order[];
}

export default createContainer(
  (): OrderContainer => {
    const container = useContainer<{ [key: string]: any }>(STORAGE_KEY, {});
    const userContainer = UserProvider.useContainer();
    const user = userContainer.getUser();

    // real time updates
    useEffect(() => {
      let unsubscribe: () => void = () => null;
      if (user?.id) {
        // listening for orders not delivered
        unsubscribe = db
          .collection(COLLECTION)
          .where('customer.id', '==', user.id)
          .where('status', 'in', [
            'payment_pending',
            'payment_in_process',
            'payment_rejected',
            'confirmation_pending',
            'in_delivery',
          ])
          .orderBy('updatedAt')
          .limit(30)
          .onSnapshot(
            (querySnapshot) => {
              const orders: any[] = [];
              querySnapshot.forEach((doc) => {
                orders.push(doc.data());
              });
              container.set('orders', orders);
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
        unsubscribe();
      };
    }, [user?.id]);

    return {
      list,
    };

    function list(filter = (order: Order) => !!order) {
      const orders = container.get('orders') || [];
      return orders.filter(filter);
    }
  }
);
