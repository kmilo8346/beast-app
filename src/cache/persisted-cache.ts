import { AsyncStorage } from 'react-native';

const prefix = '[persisted cache]';

export default class PersistedCache<T> {
  protected data?: T;

  private path: string;

  constructor(path: string) {
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

  getData(): T | undefined {
    return this.data;
  }

  async setData(data: T) {
    this.data = data;
    await this.persist();
  }

  async updateData(update: Partial<T>) {
    this.data = { ...this.data, ...update } as T;
    await this.persist();
  }

  async replaceData(replace: Partial<T>) {
    this.data = { ...replace } as T;
    await this.persist();
  }
}
