// cache
import OrdersInProgressCache from './orders-in-progress-cache';

class OrdersInProgressCacheManager {
  private references: { [key: string]: OrdersInProgressCache } = {};

  async get(id: string): Promise<OrdersInProgressCache> {
    // stopping others cache
    Object.keys(this.references).forEach((key) => {
      if (key !== id) {
        this.references[key].stopListening();
      }
    });

    if (id in this.references) {
      return this.references[id];
    }

    const cache = new OrdersInProgressCache(id);
    await cache.init();
    this.references[id] = cache;
    return cache;
  }
}

export default new OrdersInProgressCacheManager();
