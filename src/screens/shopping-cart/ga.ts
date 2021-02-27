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
    const params: { [key: string]: any } = {
      store_id: data.store.id,
      store_name: data.store.name,
      stats_ammount: data.stats.amount,
      stats_total: data.stats.total,
    };
    data.items.forEach((item, index) => {
      params[`items_${index}`] = `${item.id}|${item.price}|${item.qty}`;
    });
    await Analtytics.logEvent('send_order_message', params);
  } catch (error) {
    capture(prefix, 'Send order message event error', error);
  }
};
