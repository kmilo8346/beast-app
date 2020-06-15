export interface IntegerRange {
  lte: number;
  gte: number;
}

export interface Store {
  id: string;
  name: string;
  phone: string;
  images: string[];
  deliveryTime: IntegerRange;
  deliveryArea: {
    type: 'Polygon';
    coordinates: Array<Array<number>>;
  };
}

export interface Product {
  id: string;
  type: 'product' | 'service';
  name: string;
  description?: string;
  images: string[];
  price: number | null;
  brand?: string;
  format?: string;
  tags: string[];
  categories: string[];
  store: Store;
  qty: number;
}

export interface Address {
  id: string;
  street: string;
  number: string;
  apartment?: string;
}

export interface User {
  currentAddress: Address;
  addresses: Address[];
}

export interface SearchParams {
  query?: string;
  filters?: { [key: string]: any };
  from?: number;
  size?: number;
  source?: string[];
}

export interface SearchResponse<T> {
  total: number;
  hits: T[];
}
