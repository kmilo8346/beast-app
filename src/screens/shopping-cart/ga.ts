// cache
import { StoreShoppingCartSnapshot } from '../../cache/shopping-cart';
// lib
import { capture } from '../../lib/sentry';
import Analtytics from '../../lib/analytics';

const prefix = '[shopping cart screen ga]';

export const sendOrderMessageEvent = async (
  data: StoreShoppingCartSnapshot
) => {
  try {
    await Analtytics.logEvent('send_order_message', {
      store_id: data.store.id,
      store_name: data.store.name,
      products: data.items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
      })),
      stats_ammount: data.stats.amount,
      stats_total: data.stats.total,
    });
  } catch (error) {
    capture(prefix, 'Send order message event error', error);
  }
};
