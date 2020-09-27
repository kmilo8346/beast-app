// cache
import PersistedCache from './persisted-cache';
// types
import { Item, Product } from '../types';

export interface ShoppingCartSnapshot {
  stats: {
    total: number;
    ammount: number;
  };
  items: Item[];
}

export default class ShoppingCartCache extends PersistedCache<{
  [key: string]: Item;
}> {
  private change_item_subscribers: {
    [key: string]: ((data: Item | undefined) => void)[];
  } = {};

  private notifyItemChange(id: string, data: Item | undefined) {
    (this.change_item_subscribers[id] || []).forEach((callback) => {
      callback(data);
    });
  }

  getSnapshot(): ShoppingCartSnapshot {
    return Object.keys(this.data || {}).reduce<ShoppingCartSnapshot>(
      (snapshopt, key) => {
        const item = (this.data || {})[key];
        const result = { ...snapshopt };
        // stats
        result.stats.total = item.qty + snapshopt.stats.total;
        result.stats.ammount = item.qty * item.price + snapshopt.stats.ammount;
        // items
        result.items.push(item);
        return snapshopt;
      },
      {
        stats: { total: 0, ammount: 0 },
        items: [],
      }
    );
  }

  set(product: Product | Item, qty: number) {
    const data = this.data || {};

    if (qty > 0) {
      const newItem = { ...product, qty };
      data[product.id] = newItem;
    } else {
      delete data[product.id];
    }

    // set data
    this.setData(data);
    // notify
    this.notifyItemChange(product.id, data[product.id]);
  }

  add(product: Product | Item, qty: number) {
    const data = this.data || {};
    const item = data[product.id] || {};
    data[product.id] = { ...product, qty: (item.qty || 0) + qty };

    // set data
    this.setData(data);
    // notify
    this.notifyItemChange(product.id, data[product.id]);
  }

  clear() {
    const data = this.data || {};
    Object.keys(data).forEach((id) => {
      this.set(data[id], 0);
    });
  }

  onChangeItem(id: string, callback: (data: Item | undefined) => void) {
    const item = (this.data || {})[id];
    // initialize
    callback(item);
    // add to subscribers
    this.change_item_subscribers[id] = this.change_item_subscribers[id] || [];
    this.change_item_subscribers[id].push(callback);
    // return unsubscriber
    return () => {
      this.change_item_subscribers[id] = this.change_item_subscribers[
        id
      ].filter((subscriber) => subscriber !== callback);
    };
  }
}
