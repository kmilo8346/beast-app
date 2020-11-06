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
  extend?: (scope: Sentry.Native.Scope) => void
) => {
  // eslint-disable-next-line no-undef
  if (__DEV__) {
    let logMessage = `${prefix} ${message}`;
    if (error) {
      logMessage = `${logMessage}: ${error}`;
    }
    console.log(logMessage);
  }

  Sentry.Native.withScope((scope: Sentry.Native.Scope) => {
    scope.setExtra('prefix', prefix);
    if (extend) {
      extend(scope);
    }
    if (error) {
      scope.setExtra('message', message);
      Sentry.Native.captureException(error);
    } else {
      Sentry.Native.captureMessage(message);
    }
  });
};

export default Sentry;
