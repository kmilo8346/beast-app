export interface IntegerRange {
  lte: number;
  gte: number;
}

export interface Store {
  id: string;
  name: string;
  images: string[];
  deliveryTime: IntegerRange;
  deliveryArea: {
    type: 'Polygon';
    coordinates: Array<Array<number>>;
  };
}

export interface ServiceItem {
  id: string;
  type: 'service';
  name: string;
  description: string;
  images: string[];
  price: number | null;
  qty: 1;
  store: Store;
  tags: string[];
  categories: string[];
}

export interface ProductItem {
  id: string;
  type: 'product';
  name: string;
  description?: string;
  images: string[];
  price: number;
  brand?: string;
  format: string;
  qty: number;
  store: Store;
  tags: string[];
  categories: string[];
}

export type Product = ServiceItem | ProductItem;

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
