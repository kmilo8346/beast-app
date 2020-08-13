import { createRef } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';

// libs
import * as utils from './utils';

let promiseResolve: () => void = utils.noop;

const waitForMount = new Promise((resolve) => {
  promiseResolve = resolve;
});

export const navigationRef = createRef<NavigationContainerRef>();

export const onReady = promiseResolve;

export async function navigate(name: string, params?: { [key: string]: any }) {
  await waitForMount;
  navigationRef.current?.navigate(name, params);
}
