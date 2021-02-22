import * as Analytics from 'expo-firebase-analytics';
import Constants from 'expo-constants';

if (Constants.manifest.extra.BEAST_ENVIRONMENT === 'development') {
  Analytics.setAnalyticsCollectionEnabled(false);
}

// uncomment to be track using the DebugView in the Analytics dashboard.
// Analytics.setDebugModeEnabled(true);

export default Analytics;
