import EventSource from 'react-native-event-source';
import Constants from 'expo-constants';
import isAfter from 'date-fns/isAfter';
import sub from 'date-fns/sub';
import axios, { CancelTokenSource } from 'axios';

// clients
import orderClient from '../clients/order-client';
// cache
import PersistedCache from './persisted-cache';
// types
import { Order } from '../types';
// libs
import { capture } from '../lib/sentry';

// instances outside
const prefix = '[pending seller orders cache]';
let fetchRequestSource: CancelTokenSource;

export const getTotal = (data?: PendingSellerOrdersCacheData): number => {
  return (data?.orders || []).reduce((total) => total + 1, 0);
};

export interface PendingSellerOrdersCacheData {
  water_mark: string;
  orders: Order[];
  viewed: { [key: string]: boolean };
}

export default class PendingSellerOrdersCache extends PersistedCache<
  PendingSellerOrdersCacheData
> {
  private seller: string;

  private source: EventSource;

  constructor(seller: string) {
    super(`pending-seller-orders/${seller}`);
    this.seller = seller;
    this.source = new EventSource(
      `${Constants.manifest.extra.BEAST_API_URL}/streams/orders?filters[seller]=${seller}`
    );
  }

  private onDataHandler(data: Order | Order[]) {
    let newOrders = Array.isArray(data) ? data : [data];

    const orders = this.data?.orders || [];

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      let exist = false;
      for (let j = 0; j < newOrders.length; j++) {
        const newOrder = newOrders[j];
        if (order.id === newOrder.id) {
          exist = true;
          break;
        }
      }
      if (!exist) {
        newOrders = [...newOrders, order];
      }
    }

    newOrders = newOrders.sort(
      (a, b): number =>
        new Date(b.updated_at).valueOf() - new Date(a.updated_at).valueOf()
    );

    newOrders = newOrders.filter((order) => !this.isViewed(order));

    this.updateData({
      water_mark: newOrders.length
        ? new Date(newOrders[0].updated_at).toISOString()
        : (this.data?.water_mark as string),
      orders: newOrders,
    });
  }

  markAsViewed(id: string) {
    this.updateData({
      orders: (this.data?.orders || []).filter((order) => order.id !== id),
      viewed: { ...this.data?.viewed, [id]: true },
    });
  }

  isViewed(order: Order): boolean {
    if (isAfter(sub(new Date(), { days: 5 }), new Date(order.updated_at))) {
      return true;
    }

    return !!this.data?.viewed[order.id];
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
            seller: this.seller,
            water_mark: this.data?.water_mark,
          },
          from: 0,
          size: 50,
          sort: { updated_at: 'desc' },
          source: ['id', 'updated_at'],
        },
        {
          cancelToken: fetchRequestSource.token,
          'axios-retry': {
            retries: 100,
          },
        } as any
      );

      this.onDataHandler(response.hits);
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Fetch error', error);
      }
    }
  }

  async startListening() {
    await this.load();
    // set defaults
    if (!this.data) {
      this.setData({
        water_mark: sub(new Date(), { days: 5 }).toISOString(),
        orders: [],
        viewed: {},
      });
    }

    await this.fetch();

    this.source.addEventListener('message', (event) => {
      if (event.type !== 'message') {
        console.warn(`${prefix} Invalid event type, type: ${event.type}`);
        return;
      }

      if (event.data) {
        this.onDataHandler(JSON.parse(event.data));
      }
    });
  }

  async stopListening() {
    fetchRequestSource && fetchRequestSource.cancel();
    this.source.removeAllListeners();
  }
}
