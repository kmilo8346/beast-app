import { AsyncStorage } from 'react-native';

import Cache from './cache';

const prefix = '[persisted cache]';

export default class PersistedCache<T> extends Cache<T> {
  private path: string;

  constructor(path: string) {
    super();
    this.path = path;
  }

  async load() {
    try {
      const raw: string | null = await AsyncStorage.getItem(
        `@cache/${this.path}`
      );
      if (raw) {
        this.data = JSON.parse(raw);
      }
    } catch (error) {
      console.log(
        `${prefix} Unexpected error loading data from @cache/${this.path}`,
        error
      );
    }
  }

  async persist() {
    try {
      await AsyncStorage.setItem(
        `@cache/${this.path}`,
        JSON.stringify(this.data)
      );
    } catch (error) {
      console.log(
        `${prefix} Unexpected error persisting data in @cache/${this.path}`,
        error
      );
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
