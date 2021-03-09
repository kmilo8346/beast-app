// lib
import { capture } from '../../lib/sentry';
import Analtytics from '../../lib/analytics';
// types
import { NotificationAttribution } from '../../types';

const prefix = '[home screen ga]';

export const notificationOpenEvent = async (
  attribution: NotificationAttribution
) => {
  try {
    await Analtytics.logEvent('notification_open', attribution);
  } catch (error) {
    capture(prefix, 'Notification open event error', error);
  }
};
