// lib
import { capture } from '../../lib/sentry';
import Analtytics from '../../lib/analytics';
// types
import { Product, Store } from '../../types';

const prefix = '[product screen ga]';

export const sendProductMessageEvent = async (
  store: Store,
  product: Product
) => {
  try {
    await Analtytics.logEvent('send_product_message', {
      store_id: store.id,
      store_name: store.name,
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
    });
  } catch (error) {
    capture(prefix, 'Send product message event error', error);
  }
};
