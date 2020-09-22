import * as Sentry from 'sentry-expo';
import Constants from 'expo-constants';

Sentry.init({
  dsn: Constants.manifest.extra.SENTRY_DSN,
  environment: Constants.manifest.extra.BEAST_ENVIRONMENT,
  // change to test sentry code in development
  enableInExpoDevelopment: false,
  debug: false,
});

export const capture = (
  prefix: string,
  message: string,
  error?: Error,
  extend?: (scope: Sentry.Scope) => void
) => {
  // eslint-disable-next-line no-undef
  if (__DEV__) {
    let logMessage = `${prefix} ${message}`;
    if (error) {
      logMessage = `${logMessage}: ${error}`;
    }
    console.log(logMessage);
  }

  Sentry.withScope((scope: Sentry.Scope) => {
    scope.setExtra('prefix', prefix);
    if (extend) {
      extend(scope);
    }
    if (error) {
      scope.setExtra('message', message);
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(message);
    }
  });
};

export default Sentry;
