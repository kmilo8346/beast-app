// cache
import PersistedCache from './persisted-cache';
// types
import { Item, Product, Store } from '../types';

// instances outside

export const getSnapshot = (data?: ShoppingCart): ShoppingCartSnapshot => {
  const shoppingCart = data || {};

  return Object.keys(shoppingCart).reduce((snapshot, storeId) => {
    const storeShoppingCart = shoppingCart[storeId];
    if (!storeShoppingCart) {
      return snapshot;
    }
    return [
      ...snapshot,
      Object.keys(storeShoppingCart.items).reduce(
        (storeSnapshot, productId) => {
          const result = { ...storeSnapshot };
          const product = storeShoppingCart.items[productId];
          if (!product) {
            return result;
          }
          result.items.push(product);
          result.stats.total += product.qty;
          result.stats.amount += product.qty * product.price;
          return result;
        },
        {
          store: storeShoppingCart.store,
          items: [],
          stats: { total: 0, amount: 0 },
        } as StoreShoppingCartSnapshot
      ),
    ];
  }, [] as ShoppingCartSnapshot);
};

export const getTotal = (data?: ShoppingCart): number => {
  const shoppingCart = data || {};

  return Object.keys(shoppingCart).reduce((total, storeId) => {
    const storeShoppingCart = shoppingCart[storeId];
    return (
      total +
      Object.keys(storeShoppingCart.items).reduce((total, productId) => {
        const item = storeShoppingCart.items[productId];
        return total + item.qty;
      }, 0)
    );
  }, 0);
};

export const getAmount = (data?: StoreShoppingCart): number => {
  const itemsHash = data?.items || {};

  return Object.keys(itemsHash).reduce((amount, id) => {
    const item = itemsHash[id];
    return amount + item.qty * item.price;
  }, 0);
};

export interface StoreShoppingCartSnapshot {
  store: Store;
  items: Item[];
  stats: {
    total: number;
    amount: number;
  };
}

export type ShoppingCartSnapshot = StoreShoppingCartSnapshot[];

export interface StoreShoppingCart {
  store: Store;
  items: { [key: string]: Item };
}

export interface ShoppingCart {
  [key: string]: StoreShoppingCart;
}

class ShoppingCartCacheV2 extends PersistedCache<ShoppingCart> {
  private store_subscribers: {
    [key: string]: ((data?: StoreShoppingCart) => void)[];
  } = {};

  private item_subscribers: {
    [key: string]: ((data?: Item) => void)[];
  } = {};

  isEmpty() {
    return !Object.keys(this.data || {}).length;
  }

  set(store: Store, product: Product, qty: number) {
    const data = this.data || {};
    data[store.id] = data[store.id] || {};
    data[store.id].items = data[store.id].items || {};

    if (qty > 0) {
      data[store.id].store = store;
      data[store.id].items[product.id] = { ...product, qty };
    } else {
      delete data[store.id].items[product.id];
      if (!Object.keys(data[store.id].items).length) {
        delete data[store.id];
      }
    }

    // set data
    this.setData(data);
    // notify store change
    this.notifyStoreChange(store.id, data[store.id]);
    // notify item change
    this.notifyItemChange(
      `${store.id}|${product.id}`,
      data[store.id]?.items[product.id]
    );
  }

  clear() {
    const shoppingCart = this.data || {};
    Object.keys(shoppingCart).forEach((storeId) => {
      this.clearStore(storeId);
    });
  }

  clearStore(store: string) {
    const shoppingCart = this.data || {};
    const storeShoppingCart = shoppingCart[store];
    if (!storeShoppingCart) {
      return;
    }
    storeShoppingCart.items = storeShoppingCart.items || {};
    Object.keys(storeShoppingCart.items).forEach((id) => {
      this.set(storeShoppingCart.store, storeShoppingCart.items[id], 0);
    });
  }

  onChangeStore(store: string, callback: (data?: StoreShoppingCart) => void) {
    // initialize
    const shoppingCart = this.data || {};
    callback(shoppingCart[store]);

    // add to subscribers
    this.store_subscribers[store] = this.store_subscribers[store] || [];
    this.store_subscribers[store].push(callback);
    // return unsubscriber
    return () => {
      this.store_subscribers[store] = this.store_subscribers[store].filter(
        (subscriber) => subscriber !== callback
      );
    };
  }

  onChangeItem(
    store: string,
    product: string,
    callback: (data: Item | undefined) => void
  ) {
    // initialize
    const shoppingCart = this.data || {};
    callback(shoppingCart[store]?.items[product]);

    // add to subscribers
    const id = `${store}|${product}`;
    this.item_subscribers[id] = this.item_subscribers[id] || [];
    this.item_subscribers[id].push(callback);
    // return unsubscriber
    return () => {
      this.item_subscribers[id] = this.item_subscribers[id].filter(
        (subscriber) => subscriber !== callback
      );
    };
  }

  private notifyItemChange(id: string, data?: Item) {
    (this.item_subscribers[id] || []).forEach((callback) => {
      callback(data);
    });
  }

  private notifyStoreChange(id: string, data: StoreShoppingCart) {
    (this.store_subscribers[id] || []).forEach((callback) => {
      callback(data);
    });
  }
}

export default new ShoppingCartCacheV2('shopping-cart');
