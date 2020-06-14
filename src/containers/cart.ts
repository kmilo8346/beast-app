import { createContainer } from 'unstated-next';

import useContainer from './container';
import { Product, Store } from '../types';

const STORAGE_KEY = 'user';

export type Cart = { store: Store; items: Product[] }[];

export interface CartContainer {
  getCart: () => Cart;
  getItemQty: (product: Product) => number;
  setItem: (item: Product) => void;
}

export default createContainer(
  (): CartContainer => {
    const container = useContainer(STORAGE_KEY);

    const getCart = (): Cart => {
      const db = container.getAll();

      const storesDb: { [key: string]: Product[] } = {};
      Object.keys(db).forEach((key) => {
        const [storeId] = key.split('-');
        storesDb[storeId] = storesDb[storeId] || [];
        storesDb[storeId].push(db[key]);
      });
      return Object.keys(storesDb).map((storeId) => {
        return {
          store: storesDb[storeId][0].store,
          items: storesDb[storeId],
        };
      });
    };

    const getItemQty = (product: Product): number => {
      const key = `${product.store.id}-${product.id}`;
      const item = container.get(key);
      if (item) {
        return item.qty;
      }
      return 0;
    };

    const setItem = (item: Product) => {
      const key = `${item.store.id}-${item.id}`;
      container.set(key, item);
    };

    return {
      getCart,
      getItemQty,
      setItem,
    };
  }
);
