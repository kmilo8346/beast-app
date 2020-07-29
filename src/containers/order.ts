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
const db = firebase.firestore();

export interface OrderContainer {
  purchases: (filter?: (order: Order) => boolean) => Order[];
  sales: (filter?: (order: Order) => boolean) => Order[];
}

export default createContainer(
  (): OrderContainer => {
    const container = useContainer<{ [key: string]: any }>(STORAGE_KEY, {});
    const userContainer = UserProvider.useContainer();
    const user = userContainer.getUser();

    // real time updates for purchases
    useEffect(() => {
      let unsubscribe: () => void = () => null;

      if (user?.id) {
        // listening for purchases not delivered
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
          .limit(10)
          .onSnapshot((querySnapshot) => {
            const purchases: any[] = [];
            querySnapshot.forEach((doc) => {
              purchases.push(doc.data());
            });
            container.set('purchases', purchases);
          });
      }

      return () => {
        unsubscribe();
      };
    }, [user?.id]);

    // real time updates for sales
    useEffect(() => {
      let unsubscribe: () => void = () => null;

      if (user?.store?.id) {
        // listening for sales not delivered
        unsubscribe = db
          .collection(COLLECTION)
          .where('transaction.store.id', '==', user.store.id)
          .where('status', 'in', ['confirmation_pending', 'in_delivery'])
          .orderBy('updatedAt')
          .limit(10)
          .onSnapshot((querySnapshot) => {
            const sales: any[] = [];
            querySnapshot.forEach((doc) => {
              sales.push(doc.data());
            });
            container.set('sales', sales);
          });
      }

      return () => {
        unsubscribe();
      };
    }, [user?.store?.id]);

    return {
      purchases,
      sales,
    };

    function purchases(filter = (order: Order) => !!order) {
      return (container.get('purchases') || []).filter(filter);
    }

    function sales(filter = (order: Order) => !!order) {
      return (container.get('sales') || []).filter(filter);
    }
  }
);
