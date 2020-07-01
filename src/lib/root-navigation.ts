import { createRef } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createRef<NavigationContainerRef>();

export function navigate(name: string, params?: { [key: string]: any }) {
  navigationRef.current?.navigate(name, params);
}
