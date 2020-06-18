import { createContainer } from 'unstated-next';

import useContainer from './container';
import { Product, Store } from '../types';

const STORAGE_KEY = 'cart';

export type Cart = { store: Store; data: Product[] }[];

export interface CartContainer {
  isEmpty: () => boolean;
  getCart: () => Cart;
  getItemQty: (product: Product) => number;
  getStats: () => { ammount: number; total: number };
  setItem: (item: Product) => void;
}

export default createContainer(
  (): CartContainer => {
    const container = useContainer(STORAGE_KEY);

    const isEmpty = (): boolean => {
      return !Object.keys(container.getAll()).length;
    };

    const getCart = (): Cart => {
      const db = container.getAll();
      const storesDb: { [key: string]: Product[] } = {};
      Object.keys(db).forEach((key) => {
        const [storeId] = key.split('|');
        storesDb[storeId] = storesDb[storeId] || [];
        storesDb[storeId].push(db[key]);
      });
      return Object.keys(storesDb).map((storeId) => {
        return {
          store: storesDb[storeId][0].store,
          data: storesDb[storeId],
        };
      });
    };

    const getItemQty = (product: Product): number => {
      const key = `${product.store.id}|${product.id}`;
      const item = container.get(key);
      if (item) {
        return item.qty;
      }
      return 0;
    };

    const getStats = (): { ammount: number; total: number } => {
      const db = container.getAll();
      const stats = {
        ammount: 0,
        total: 0,
      };
      Object.keys(db).forEach((key) => {
        const item = db[key];
        stats.total += item.qty;
        stats.ammount += item.qty * item.price;
      });
      return stats;
    };

    const setItem = (item: Product) => {
      const key = `${item.store.id}|${item.id}`;
      container.set(key, item);
      if (item.qty <= 0) {
        container.remove(key);
      }
    };

    return {
      isEmpty,
      getCart,
      getItemQty,
      getStats,
      setItem,
    };
  }
);
