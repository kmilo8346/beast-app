export default class Cache<T> {
  protected data?: T;

  private subscribers: ((data: T | undefined) => void)[];

  constructor() {
    this.subscribers = [];
  }

  private notify(data: T) {
    this.subscribers.forEach((callback) => {
      callback(data);
    });
  }

  getData(): T | undefined {
    return this.data;
  }

  setData(data: T) {
    this.data = data;
    this.notify(this.data);
  }

  updateData(update: Partial<T>) {
    this.data = { ...this.data, ...update } as T;
    this.notify(this.data);
  }

  replaceData(replace: Partial<T>) {
    this.data = { ...replace } as T;
    this.notify(this.data);
  }

  onChange(callback: (data: T | undefined) => void) {
    // initialize
    callback(this.data);
    // add to subscribers
    this.subscribers.push(callback);
    // return unsubscribers
    return () => {
      this.subscribers = this.subscribers.filter(
        (subscriber) => subscriber !== callback
      );
    };
  }
}
