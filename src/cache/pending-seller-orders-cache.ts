import isAfter from 'date-fns/isAfter';
import sub from 'date-fns/sub';
import axios, { CancelTokenSource } from 'axios';
import { Channel } from 'pusher-js/react-native';
import { AppState, AppStateStatus, AsyncStorage } from 'react-native';
import Constants from 'expo-constants';
import axiosRetry from 'axios-retry';

// clients
import orderClient from '../clients/order-client';
// cache
import Cache from './cache';
import userCache from './user';
// types
import { Order } from '../types';
// libs
import { capture } from '../lib/sentry';
import pusher from '../lib/pusher';

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

class PendingSellerOrdersCache extends Cache<PendingSellerOrdersCacheData> {
  private active: boolean;

  private seller?: string;

  private channel?: Channel;

  constructor() {
    super();
    this.active = AppState.currentState === 'active';
    this.seller = userCache.getData()?.id;
    this.takeDecision(this.active, this.seller);

    userCache.onChange((data) => {
      this.takeDecision(this.active, data?.id);
    });

    AppState.addEventListener('change', (state: AppStateStatus) => {
      this.takeDecision(state === 'active', this.seller);
    });
  }

  private async load(seller: string) {
    try {
      const raw: string | null = await AsyncStorage.getItem(
        `@cache/${Constants.manifest.extra.BEAST_ENVIRONMENT}/seller/${seller}/pending-orders`
      );

      this.data = raw ? JSON.parse(raw) : undefined;
    } catch (error) {
      capture(prefix, 'Load error', error);
    }
  }

  async persist(seller: string) {
    try {
      await AsyncStorage.setItem(
        `@cache/${Constants.manifest.extra.BEAST_ENVIRONMENT}/seller/${seller}/pending-orders`,
        JSON.stringify(this.data)
      );
    } catch (error) {
      capture(prefix, 'Persist error', error);
    }
  }

  private async setSellerData(
    seller: string,
    data: PendingSellerOrdersCacheData
  ) {
    this.setData(data);
    await this.persist(seller);
  }

  private async updateSellerData(
    seller: string,
    update: Partial<PendingSellerOrdersCacheData>
  ) {
    this.updateData(update);
    await this.persist(seller);
  }

  private takeDecision(active: boolean, seller?: string) {
    // skip when not change
    if (this.active === active && this.seller === seller) {
      return;
    }
    this.active = active;
    this.seller = seller;

    if (active && seller) {
      this.startListening(seller);
    } else {
      this.stopListening();
    }
  }

  private onDataHandler(seller: string, data: Order | Order[]) {
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

    this.updateSellerData(seller, {
      water_mark: newOrders.length
        ? new Date(newOrders[0].updated_at).toISOString()
        : (this.data?.water_mark as string),
      orders: newOrders,
    });
  }

  markAsViewed(id: string) {
    if (this.seller) {
      this.updateSellerData(this.seller, {
        orders: (this.data?.orders || []).filter((order) => order.id !== id),
        viewed: { ...this.data?.viewed, [id]: true },
      });
    }
  }

  isViewed(order: Order): boolean {
    if (isAfter(sub(new Date(), { days: 2 }), new Date(order.updated_at))) {
      return true;
    }

    return !!this.data?.viewed[order.id];
  }

  async fetch(seller: string) {
    try {
      if (fetchRequestSource) {
        fetchRequestSource.cancel();
      }
      fetchRequestSource = axios.CancelToken.source();

      const response = await orderClient.search(
        {
          filters: {
            seller,
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
            retryDelay: axiosRetry.exponentialDelay,
          },
        } as any
      );

      this.onDataHandler(seller, response.hits);
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Fetch error', error);
      }
    }
  }

  async startListening(seller: string) {
    await this.load(seller);
    // set defaults
    if (!this.data) {
      this.setSellerData(seller, {
        water_mark: sub(new Date(), { days: 2 }).toISOString(),
        orders: [],
        viewed: {},
      });
    }

    this.fetch(seller);

    this.channel = pusher.subscribe(`seller_${this.seller}`);
    this.channel.bind('order.created', (data: Order) => {
      this.onDataHandler(seller, [data]);
    });
  }

  async stopListening() {
    fetchRequestSource && fetchRequestSource.cancel();
    this.channel?.unbind();
    pusher.unsubscribe(`seller_${this.seller}`);
  }
}

export default new PendingSellerOrdersCache();
