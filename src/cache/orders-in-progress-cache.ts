import sub from 'date-fns/sub';
import isBefore from 'date-fns/isBefore';
import axios, { CancelTokenSource } from 'axios';
import { Channel } from 'pusher-js/react-native';
import { AppState, AppStateStatus, AsyncStorage } from 'react-native';
import Constants from 'expo-constants';
import axiosRetry from 'axios-retry';

// clients
import orderClient from '../clients/order-client';
// cache
import PersistedCache from './persisted-cache';
import userCache from './user';
// types
import { Order, OrderStatus } from '../types';
// libs
import { capture } from '../lib/sentry';
import pusher from '../lib/pusher';

// instances outside
const prefix = '[orders in progress cache]';
let fetchRequestSource: CancelTokenSource;

export enum OrderType {
  CLIENT = 'client',
  SELLER = 'seller',
}

export interface TypedOrder {
  id: string;
  type: OrderType;
  data: Order;
}

export const toTyped = (orders?: Order[], user?: string) => {
  const typed: TypedOrder[] = [];
  (orders || []).forEach((order) => {
    if (order.customer.id === user) {
      typed.push({
        id: `client_${order.id}`,
        type: OrderType.CLIENT,
        data: order,
      });
    }
    if (order.transaction.shopping_cart.store.user === user) {
      typed.push({
        id: `seller_${order.id}`,
        type: OrderType.SELLER,
        data: order,
      });
    }
  });
  return typed;
};

export interface OrdersInProgressCacheData {
  orders: Order[];
}

class OrdersInProgressCache extends PersistedCache<OrdersInProgressCacheData> {
  private active: boolean;

  private user?: string;

  private water_mark: string;

  private marks: { [key: string]: Date };

  private client_channel?: Channel;

  private seller_channel?: Channel;

  constructor() {
    super('');
    this.active = AppState.currentState === 'active';
    this.user = userCache.getData()?.id;
    this.water_mark = sub(new Date(), { days: 2 }).toISOString();
    this.marks = {};

    userCache.onChange((data) => {
      this.reactToChanges(this.active, data?.id);
    });

    AppState.addEventListener('change', (state: AppStateStatus) => {
      this.reactToChanges(state === 'active', this.user);
    });
  }

  private reactToChanges(active: boolean, user?: string) {
    // skip when not change
    if (this.active === active && this.user === user) {
      return;
    }
    this.active = active;
    this.user = user;

    if (active && user) {
      this.startListening();
    } else {
      this.stopListening();
    }
  }

  private filterConflicts(orders: Order[]) {
    return orders.filter((order) => {
      if (isBefore(new Date(order.updated_at), sub(new Date(), { days: 2 }))) {
        // skip old events
        return false;
      }
      if (
        this.marks[order.id] &&
        this.marks[order.id].getTime() > new Date(order.updated_at).getTime()
      ) {
        // skip event with incorrect arrive order
        return false;
      }

      // mark date to validate new events
      this.marks[order.id] = new Date(order.updated_at);
      return true;
    });
  }

  private dataHandler(data: Order[]) {
    let newOrders = this.filterConflicts(data);

    const oldOrders = this.data?.orders || [];

    for (let i = 0; i < oldOrders.length; i++) {
      const oldOrder = oldOrders[i];
      let exist = false;
      for (let j = 0; j < newOrders.length; j++) {
        const newOrder = newOrders[j];
        if (oldOrder.id === newOrder.id) {
          exist = true;
          break;
        }
      }
      if (!exist) {
        newOrders = [...newOrders, oldOrder];
      }
    }

    newOrders = newOrders.filter(
      (order) =>
        order.status === OrderStatus.CREATED ||
        order.status === OrderStatus.CONFIRMED
    );

    newOrders = newOrders.sort(
      (a, b): number =>
        new Date(b.updated_at).valueOf() - new Date(a.updated_at).valueOf()
    );

    // update water mark
    this.water_mark = newOrders.length
      ? new Date(newOrders[0].updated_at).toISOString()
      : this.water_mark;

    this.updateData({ orders: newOrders });
  }

  async load() {
    try {
      const raw: string | null = await AsyncStorage.getItem(
        `@cache/${Constants.manifest.extra.BEAST_ENVIRONMENT}/users/${this.user}/orders-in-progress`
      );

      const data = raw ? JSON.parse(raw) : { orders: [] };
      this.dataHandler(data.orders);
    } catch (error) {
      capture(prefix, 'Load error', error);
    }
  }

  async persist() {
    try {
      await AsyncStorage.setItem(
        `@cache/${Constants.manifest.extra.BEAST_ENVIRONMENT}/users/${this.user}/in-progress-orders`,
        JSON.stringify(this.data)
      );
    } catch (error) {
      capture(prefix, 'Persist error', error);
    }
  }

  async fetch() {
    try {
      if (fetchRequestSource) {
        fetchRequestSource.cancel();
      }
      fetchRequestSource = axios.CancelToken.source();

      const response = await orderClient.search(
        {
          filters: {
            should_client: this.user,
            should_seller: this.user,
            water_mark: this.water_mark,
          },
          from: 0,
          size: 50,
          sort: { updated_at: 'desc' },
        },
        {
          cancelToken: fetchRequestSource.token,
          'axios-retry': {
            retries: 100,
            retryDelay: axiosRetry.exponentialDelay,
          },
        } as any
      );

      this.dataHandler(response.hits);
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Fetch error', error);
      }
    }
  }

  async startListening() {
    await this.load();

    this.fetch();

    // subscribe to client orders events
    this.client_channel = pusher.subscribe(`client_${this.user}`);
    this.client_channel.bind('order.created', (data: Order) => {
      this.dataHandler([data]);
    });
    this.client_channel.bind('order.confirmed', (data: Order) => {
      this.dataHandler([data]);
    });
    this.client_channel.bind('order.delivered', (data: Order) => {
      this.dataHandler([data]);
    });
    this.client_channel.bind('order.cancelled', (data: Order) => {
      this.dataHandler([data]);
    });

    // subcribe to seller orders events
    this.seller_channel = pusher.subscribe(`seller_${this.user}`);
    this.seller_channel.bind('order.created', (data: Order) => {
      this.dataHandler([data]);
    });
    this.seller_channel.bind('order.confirmed', (data: Order) => {
      this.dataHandler([data]);
    });
    this.seller_channel.bind('order.delivered', (data: Order) => {
      this.dataHandler([data]);
    });
    this.seller_channel.bind('order.cancelled', (data: Order) => {
      this.dataHandler([data]);
    });
  }

  async stopListening() {
    fetchRequestSource && fetchRequestSource.cancel();
    this.client_channel?.unbind();
    pusher.unsubscribe(`client_${this.user}`);
    this.seller_channel?.unbind();
    pusher.unsubscribe(`seller_${this.user}`);
  }
}

export default new OrdersInProgressCache();
