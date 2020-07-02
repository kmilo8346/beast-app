import { createContainer } from 'unstated-next';

import useContainer from './container';
import { Product, Store } from '../types';

const STORAGE_KEY = 'cart';

interface Stats {
  ammount: number;
  total: number;
  byStores: {
    [key: string]: {
      id: string;
      name: string;
      ammount: number;
      total: number;
    };
  };
}
export type Cart = { store: Store; data: Product[] }[];

export interface CartContainer {
  isEmpty: () => boolean;
  getCart: () => Cart;
  getItemQty: (product: Product) => number;
  getStats: () => Stats;
  setItem: (item: Product) => void;
}

export default createContainer(
  (): CartContainer => {
    const container = useContainer<{ [key: string]: any }>(STORAGE_KEY, {});

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

    const getStats = (): Stats => {
      const db = container.getAll();
      const stats: Stats = {
        ammount: 0,
        total: 0,
        byStores: {},
      };
      Object.keys(db).forEach((key) => {
        const item = db[key];
        const total = item.qty;
        const ammount = item.qty * item.price;

        stats.total += total;
        stats.ammount += ammount;

        const [storeId] = key.split('|');
        console.log(storeId);
        stats.byStores[storeId] = stats.byStores[storeId] || {
          id: storeId,
          name: item.store.name,
          ammount: 0,
          total: 0,
        };
        stats.byStores[storeId].total += total;
        stats.byStores[storeId].ammount += ammount;
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
