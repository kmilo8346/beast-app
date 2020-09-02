/* eslint-disable no-await-in-loop */
import sub from 'date-fns/sub';

// clients
import orderClient from '../clients/order-client';
// cache
import PersistedCache from './persisted-cache';
// types
import { Order, OrderStatus } from '../types';

export interface OrdersInProgressCacheData {
  user: string;
  water_mark: string;
  orders: Order[];
}

export default class OrdersInProgressCache extends PersistedCache<
  OrdersInProgressCacheData
> {
  private user: string;

  constructor(user: string) {
    super(`orders-in-progress-user-${user}`);
    this.user = user;

    this.onChange((data) => {
      if (!data) {
        console.log('Order in progress cache is empty');
      } else {
        console.log(
          `Order in progres cache: (water mark:${
            data.water_mark
          }, orders: [${data.orders.reduce((text, order) => {
            let entity = 'unknown';
            if (order.customer.id === this.user) {
              entity = 'order';
            }
            if (order.transaction.store.user === this.user) {
              entity = 'sale';
            }
            return `${text},${entity}-${order.status}`;
          }, '')}]`
        );
      }
    });
  }

  public async sync() {
    await super.load();
    if (!this.data) {
      await this.setData({
        user: this.user,
        water_mark: sub(new Date(), { days: 15 }).toISOString(),
        orders: [],
      });
    }

    const data = this.data as OrdersInProgressCacheData;
    let from = 0;
    let total = 0;
    do {
      const orders = await orderClient.search({
        filters: {
          water_mark: data.water_mark,
          should_customer: this.user,
          should_seller: this.user,
        },
        from,
        size: 10,
        // source: [],
      });
      await this.add(orders.hits);
      from += orders.hits.length;
      total = orders.total;
    } while (from < total);
  }

  public async add(orders: Order[]) {
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
    newOrders = newOrders.filter(
      (order) =>
        order.status === OrderStatus.CREATED ||
        order.status === OrderStatus.CONFIRMED
    );
    await this.updateData({
      user: this.user,
      water_mark: mark,
      orders: newOrders,
    });
  }
}
