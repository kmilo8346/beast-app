export default class Cache<T> {
  data?: T;

  getData(): T | undefined {
    return this.data;
  }

  setData(data: T) {
    this.data = data;
  }

  updateData(update: Partial<T>) {
    this.data = { ...this.data, ...update } as T;
  }

  replaceData(replace: Partial<T>) {
    this.data = { ...replace } as T;
  }
}
