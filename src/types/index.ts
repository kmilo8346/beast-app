type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

export interface CreateParams<T> {
  pathVars?: { [key: string]: any };
  body: Omit<T, 'id'>;
  source?: string[];
}

export interface UpdateParams<T> {
  pathVars?: { [key: string]: any };
  body: RecursivePartial<T>;
}

export interface ActionParams<T> {
  pathVars?: { [key: string]: any };
  body?: RecursivePartial<T>;
}

export interface GetParams {
  pathVars: {
    [key: string]: any;
  };
  source?: string[];
}

export type SearchFilters = { [key: string]: any };

export interface SearchParams {
  pathVars?: { [key: string]: any };
  query?: string;
  filters?: SearchFilters;
  from?: number;
  size?: number;
  sort?: { [key: string]: 'asc' | 'desc' };
  source?: string[];
}

export interface DeleteParams {
  pathVars: {
    [key: string]: any;
  };
}

export interface SearchResponse<T> {
  query?: string;
  filters?: SearchFilters;
  from: number;
  size: number;
  sort?: { [key: string]: 'asc' | 'desc' };
  total: number;
  hits: T[];
}

export interface Redirect {
  name: string;
  params: { [key: string]: any };
}

export interface PlacesAutocompletePrediction {
  description: string;
  place_id: string;
}

export interface PlacesAutocompletResponse {
  predictions: PlacesAutocompletePrediction[];
}

export type PlacesDetailsResponse = Place;

export interface IntegerRange {
  lte: number;
  gte: number;
}

export interface Circle {
  type: 'circle';
  radius: string;
  coordinates: number[];
}

export interface AddressProp {
  short_name: string;
  long_name: string;
}

export interface Place {
  id: string;
  url: string;
  street_number?: AddressProp;
  route?: AddressProp;
  locality: AddressProp;
  administrative_area_level_3: AddressProp;
  administrative_area_level_2: AddressProp;
  administrative_area_level_1: AddressProp;
  apartment?: string;
  location: {
    lat: number;
    lon: number;
  };
  formatted_address?: string;
}

export type OpeningHours = {
  day: '1' | '2' | '3' | '4' | '5' | '6' | '7';
  open: number;
  close: number;
}[];

export interface MercadoPagoCredentials {
  access_token: string;
  expires_in: number;
  live_mode: boolean;
  public_key: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  user_id: number;
}

export interface DeliveryArea {
  center: Place;
  radius: string;
  geometry: Circle;
}

export interface PaymentProvider {
  credentials: MercadoPagoCredentials;
}

export interface CreateStore {
  user: string;
  name: string;
  phone: string;
  images: string[];
  enabled: boolean;
  reference: string;
  description?: string;
  delivery_time: IntegerRange;
  delivery_area: DeliveryArea;
  opening_hours: OpeningHours;
  payment_provider?: PaymentProvider;
}

export interface Store extends CreateStore {
  id: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProduct {
  name: string;
  price: number;
  tags?: string[];
  images: string[];
  enabled: boolean;
  reference: string;
  description?: string;
  store_info: {
    id: string;
    enabled: boolean;
    delivery_area: Circle;
    opening_hours: OpeningHours;
  };
}

export interface Product extends CreateProduct {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUser {
  id?: string;
  phone: string;
  phone_verified: boolean;
  email?: string;
  email_verified?: boolean;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  current_address?: string;
  addresses?: Place[];
  current_store?: string;
}

export interface User extends CreateUser {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Item extends Product {
  qty: number;
}

export interface CreateOrder {
  idempotency: string;
  customer: {
    id: string;
    email?: string;
    first_name: string;
    last_name?: string;
    photo_url?: string;
    phone: string;
  };
  transaction: {
    country: string;
    currency: string;
    language: string;
    delivery_address: Place;
    shopping_cart: {
      store: Store;
      items: Item[];
    };
  };
}

export interface Order extends CreateOrder {
  id: string;
  stats: {
    amount: number;
    total: number;
  };
  created_at: Date;
  updated_at: Date;
}

export interface CreateDevice {
  token: string;
  user_id: string;
}

export interface Device extends CreateDevice {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface AddressInfo {
  current_address: string;
  addresses: Place[];
}

export interface CreateMercadoPagoCheckout {
  customer: {
    email: string;
    first_name: string;
    last_name?: string;
    phone: string;
  };
  transaction: {
    currency: string;
    delivery_address: {
      street_number: AddressProp;
      route: AddressProp;
    };
    store: {
      name: string;
      payment_provider: PaymentProvider;
    };
    amount: number;
  };
}
