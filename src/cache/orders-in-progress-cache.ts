/* eslint-disable no-await-in-loop */
import { AppState, AppStateStatus } from 'react-native';
import sub from 'date-fns/sub';
import axios, { CancelTokenSource } from 'axios';

// clients
import longPollingOrderClient from '../clients/long-polling/order-client';
// libs
import * as utils from '../lib/utils';
// cache
import PersistedCache from './persisted-cache';
// types
import { Order } from '../types';
import { capture } from '../lib/sentry';

const prefix = '[orders in progress cache]';
let fetchRequestSource: CancelTokenSource;

export interface OrdersInProgressCacheData {
  user: string;
  water_mark: string;
  orders: Order[];
}

export default class OrdersInProgressCache extends PersistedCache<
  OrdersInProgressCacheData
> {
  private user: string;

  private listening: boolean;

  private active: boolean;

  constructor(user: string) {
    super(`orders-in-progress-user-${user}`);
    this.user = user;
    this.listening = false;
    this.active = AppState.currentState === 'active';

    AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (state: AppStateStatus) => {
    this.active = state === 'active';
    if (this.active) {
      this.subscribe();
    } else if (fetchRequestSource) {
      fetchRequestSource.cancel();
    }
  };

  private async add(orders: Order[]) {
    if (!orders.length) {
      return;
    }
    let newOrders = [...(this.getData()?.orders || [])];
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      let updated = false;
      for (let j = 0; j < newOrders.length; j++) {
        const currentOrder = newOrders[j];
        if (order.id === currentOrder.id) {
          newOrders[j] = order;
          updated = true;
          break;
        }
      }
      if (!updated) {
        newOrders = [order, ...newOrders];
      }
    }
    newOrders = newOrders.sort(
      (a, b): number =>
        new Date(b.updated_at).valueOf() - new Date(a.updated_at).valueOf()
    );
    const mark = new Date(newOrders[0].updated_at).toISOString();
    await this.updateData({
      user: this.user,
      water_mark: mark,
      orders: newOrders,
    });
  }

  private async subscribe() {
    try {
      if (!this.listening || !this.active) {
        return;
      }
      if (fetchRequestSource) {
        fetchRequestSource.cancel();
      }
      fetchRequestSource = axios.CancelToken.source();
      const data = this.data as OrdersInProgressCacheData;
      const orders = await longPollingOrderClient.subscribe(
        {
          filters: {
            water_mark: data.water_mark,
            should_customer: this.user,
            should_seller: this.user,
          },
          from: 0,
          size: 10,
        },
        fetchRequestSource.token
      );
      await this.add(orders);
      this.subscribe();
    } catch (error) {
      if (!axios.isCancel(error)) {
        if (error.response?.status !== 502) {
          capture(prefix, 'Subscribe error', error);

          await utils.sleep(2000);
        }
        this.subscribe();
      }
    }
  }

  public async init() {
    await super.load();
    if (!this.data) {
      await this.setData({
        user: this.user,
        water_mark: sub(new Date(), { days: 15 }).toISOString(),
        orders: [],
      });
    }
  }

  public startListening() {
    this.listening = true;
    this.subscribe();
  }

  public async stopListening() {
    this.listening = false;
    AppState.removeEventListener('change', this.handleAppStateChange);
  }
}
