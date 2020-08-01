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
  shortName: string;
  longName: string;
}

export interface Place {
  id: string;
  url: string;
  streetNumber: AddressProp;
  route: AddressProp;
  locality: AddressProp;
  administrativeAreaLevel3: AddressProp;
  administrativeAreaLevel2: AddressProp;
  administrativeAreaLevel1: AddressProp;
  apartment: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export type OpeningHours = {
  day: '1' | '2' | '3' | '4' | '5' | '6' | '7';
  open: number;
  close: number;
}[];

export interface SellerCredentials {
  accessToken: string;
  expiresIn: number;
  liveMode: boolean;
  publicKey: string;
  refreshToken: string;
  scope: string;
  tokenType: string;
  userId: number;
}

export interface DeliveryArea {
  center: Place;
  radius: string;
  geometry: Circle;
}

export interface Store {
  id: string;
  version: number;
  name: string | undefined;
  phone: string | undefined;
  images: string[] | undefined;
  deliveryTime: IntegerRange | undefined;
  deliveryArea: DeliveryArea | undefined;
  openingHours: OpeningHours | undefined;
  sellerCredentials: SellerCredentials | undefined;
}

export interface Product {
  id: string;
  type: 'product';
  name: string;
  description: string;
  images: string[];
  price: number;
  brand?: string;
  category: string;
  tags?: string[];
  enabled: boolean;
  store: Store;
}

export interface Service {
  id: string;
  type: 'service';
  name: string;
  description: string;
  images: string[];
  price: number | null;
  category: string;
  tags?: string[];
  enabled: boolean;
  store: Store;
}

export interface Card {
  id: string;
  customerId: string;
  expirationMonth: number;
  expirationYear: number;
  firstSixDigits: string;
  lastFourDigits: string;
  paymentMethod: {
    id: string;
    name: string;
    paymentTypeId: string;
    thumbnail: string;
    secureThumbnail: string;
  };
  securityCode: {
    length: number;
    cardLocation: string;
  };
  issuer: {
    id: number;
    name: string;
  };
  cardholder: {
    name: string;
    identification: {
      number: string;
      type: string;
    };
  };
  liveMode: boolean;
  dateCreated: string;
  dateLastUpdated: string;
}

export interface User {
  id: string;
  email: string | undefined;
  identificationType: 'RUT';
  identificationNumber: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  photoUrl: string | undefined;
  // mercado pago customer id
  customerId: string | undefined;
  // phone
  phone: string | undefined;
  phoneVerified: boolean;
  // addresses
  currentAddress: string | undefined;
  addresses: Place[];
  // cards
  currentCard: string | null | undefined;
  cards: Card[];
  // store
  store: Store | undefined;

  metaData: { [key: string]: any };

  // trick for dot notation used in firestore
  [key: string]: any;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  mercadoPagoCustomerId: string;
  phone: string;
}

export interface Item extends Omit<Product, 'store'> {
  qty: number;
}

export type ShoppingCart = { store: Store; data: Item[] }[];

export type PaymentMethod = 'CREDIT_CARD' | 'TO_AGREE';

export interface PaymentInfo {
  card: Card;
  securityCode: string;
  installments: number;
}

export interface CreateShop {
  customer: Customer;
  transaction: {
    country: string;
    currency: string;
    language: string;
    deliveryAddress: Place;
    shoppingCart: ShoppingCart;
    paymentMethod: PaymentMethod;
    paymentInfo?: PaymentInfo;
  };
}

export interface Shop extends CreateShop {
  id: string;
  index: string;
  idempotency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Stats {
  total: number;
  ammount: number;
}

export type OrderStatus =
  | 'payment_pending'
  | 'payment_in_process'
  | 'payment_rejected'
  | 'confirmation_pending'
  | 'in_delivery'
  | 'delivered';

export interface CreateOrder {
  status: OrderStatus;
  shopId: string;
  customer: Customer;
  transaction: {
    country: string;
    currency: string;
    language: string;
    deliveryAddress: Place;
    paymentMethod: PaymentMethod;
    paymentInfo?: PaymentInfo;
    shoppingCart: Item[];
    store: Store;
    stats: Stats;
  };
}

export enum ProductConfirmationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  REPLACE = 'replace',
}

export type ProductConfirmation =
  | { type: ProductConfirmationType.UPDATE; id: string; qtyPosible: number }
  | { type: ProductConfirmationType.DELETE; id: string };

export type Confirmation = ProductConfirmation[];

export interface Order extends CreateOrder {
  id: string;
  index: string;
  idempotency: string;
  confirmation?: Confirmation;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateParams<T> {
  pathVars?: { [key: string]: any };
  body: Omit<T, 'id'>;
  source?: string[];
  idempotency?: string;
}

export interface UpdateParams<T> {
  pathVars?: { [key: string]: any };
  index: string;
  idempotency?: string;
  body: Partial<T>;
}

export interface ActionParams<T> {
  pathVars?: { [key: string]: any };
  index: string;
  idempotency?: string;
  body?: Partial<T>;
}

export interface GetParams {
  pathVars: {
    [key: string]: any;
  };
  source?: string[];
}

export interface SearchParams {
  pathVars?: { [key: string]: any };
  query?: string;
  filters?: { [key: string]: any };
  from?: number;
  size?: number;
  sort?: { field: string; order: 'asc' | 'desc' }[];
  source?: string[];
}

export interface DeleteParams {
  pathVars: {
    [key: string]: any;
  };
}

export interface SearchResponse<T> {
  from: number;
  size: number;
  total: number;
  hits: Partial<T>[];
}

export interface PlacesAutocompletePrediction {
  description: string;
  placeId: string;
}

export interface PlacesAutocompletResponse {
  predictions: PlacesAutocompletePrediction[];
}

export type PlacesDetailsResponse = Place;
