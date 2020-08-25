// cache
import Cache from './cache';
import ShoppingCartCache from './shopping-cart';

class ShoppingCartsCache extends Cache<{
  [key: string]: ShoppingCartCache;
}> {
  public async get(id: string) {
    const data = this.data || {};
    if (!(id in data)) {
      const shoppingCart = new ShoppingCartCache(`store/${id}`);
      await shoppingCart.load();
      data[id] = shoppingCart;
      this.setData(data);
    }
    return data[id];
  }
}

export default new ShoppingCartsCache();
