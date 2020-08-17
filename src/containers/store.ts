import { createContainer } from 'unstated-next';

import useContainer from './container';

// types
import { Store } from '../types';

const STORAGE_KEY = 'store';

interface Data {
  store?: Store;
  meta?: { [key: string]: any };
}

interface StoreContainer {
  hydrate(store: Store): void;
  update(data: Partial<Store>): void;
  get(): Store | undefined;
  meta(update?: { [key: string]: any }): { [key: string]: any };
}

export default createContainer<StoreContainer>(
  (): StoreContainer => {
    const container = useContainer<Data>(STORAGE_KEY, {});

    return {
      hydrate,
      update,
      get,
      meta,
    };

    function hydrate(store: Store) {
      container.set('store', store);
    }

    function update(data: Partial<Store>) {
      const store = container.get('store');
      container.set('store', { ...store, ...data });
    }

    function get() {
      return container.get('store');
    }

    function meta(update?: { [key: string]: any }) {
      let meta = container.get('meta');
      if (update) {
        meta = { ...meta, ...update };
        container.set('meta', meta);
      }
      return meta;
    }
  }
);
