import { AsyncStorage } from 'react-native';
import Constants from 'expo-constants';

import Cache from './cache';
import { capture } from '../lib/sentry';

const prefix = '[persisted cache]';

export default class PersistedCache<T> extends Cache<T> {
  protected path: string;

  constructor(path: string) {
    super();
    this.path = path;
  }

  async load() {
    try {
      const raw: string | null = await AsyncStorage.getItem(
        `@cache/${Constants.manifest.extra.BEAST_ENVIRONMENT}/${this.path}`
      );

      this.data = raw ? JSON.parse(raw) : undefined;
    } catch (error) {
      capture(prefix, 'Load error', error);
    }
  }

  async persist() {
    try {
      await AsyncStorage.setItem(
        `@cache/${Constants.manifest.extra.BEAST_ENVIRONMENT}/${this.path}`,
        JSON.stringify(this.data)
      );
    } catch (error) {
      capture(prefix, 'Persist error', error);
    }
  }

  async setData(data: T) {
    super.setData(data);
    await this.persist();
  }

  async updateData(update: Partial<T>) {
    super.updateData(update);
    await this.persist();
  }

  async replaceData(replace: Partial<T>) {
    super.replaceData(replace);
    await this.persist();
  }
}
