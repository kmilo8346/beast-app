// lib
import { capture } from '../../lib/sentry';
import Analtytics from '../../lib/analytics';
// types
import { Store } from '../../types';

const prefix = '[store screen ga]';

export const sendStoreQuestionMessageEvent = async (store: Store) => {
  try {
    await Analtytics.logEvent('send_store_question_message', {
      store_id: store.id,
      store_name: store.name,
    });
  } catch (error) {
    capture(prefix, 'Send store question message event error', error);
  }
};
