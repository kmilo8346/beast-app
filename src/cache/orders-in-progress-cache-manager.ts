// cache
import OrdersInProgressCache from './orders-in-progress-cache';

class OrdersInProgressCacheManager {
  private references: { [key: string]: OrdersInProgressCache } = {};

  async get(id: string): Promise<OrdersInProgressCache> {
    console.log(Object.keys(this.references));
    if (id in this.references) {
      return this.references[id];
    }

    const cache = new OrdersInProgressCache(id);
    await cache.sync();
    this.references[id] = cache;
    return cache;
  }
}

export default new OrdersInProgressCacheManager();
