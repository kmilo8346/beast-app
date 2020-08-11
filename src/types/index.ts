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
  idempotency?: string;
}

export interface UpdateParams<T> {
  pathVars?: { [key: string]: any };
  idempotency?: string;
  body: RecursivePartial<T>;
}

export interface ActionParams<T> {
  pathVars?: { [key: string]: any };
  idempotency?: string;
  body?: RecursivePartial<T>;
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

export enum PaymentProvider {
  MERCADOPAGO = 'mercadopago',
}

export enum DispatchProvider {
  OWNER = 'owner',
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
  paymentProvider: PaymentProvider;
  dispatchProvider: DispatchProvider;
}

export interface Product {
  id: string;
  type: 'product';
  name: string;
  description: string;
  images: string[];
  price: number;
  brand?: string;
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
  version: number;
  email: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  photoUrl: string | undefined;
  phone: string | undefined;
  phoneVerified: boolean;
  // addresses
  currentAddress: string | undefined;
  addresses: Place[];
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
  phone: string;
}

export interface Item extends Omit<Product, 'store'> {
  qty: number;
}

export interface Transaction {
  country: string;
  currency: string;
  language: string;
  deliveryAddress: Place;
  shoppingCart: Item[];
  store: Store;
}

export interface CreatePayment {
  customer: Customer;
  transaction: Transaction;
  redirectUrl: string;
}

export interface CreateCheckout {
  reference: string;
  customer: Customer;
  transaction: Transaction;
  redirectUrl: string;
}

export enum MercadopagoPaymentStatus {
  STARTED = 'started',
  PENDING = 'pending',
  APPROVED = 'approved',
  AUTHORIZED = 'authorized',
  IN_PROCESS = 'in_process',
  IN_MEDIATION = 'in_mediation',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  CHARGED_BACK = 'charged_back',
}

export type PaymentProviderState = {
  id: PaymentProvider.MERCADOPAGO;
  status: MercadopagoPaymentStatus;
  checkout: { id: string; initPoint: string };
  data: { [key: string]: any };
};

export enum PaymentStatus {
  CREATED = 'created',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface Payment extends CreatePayment {
  id: string;
  reference: string;
  status: PaymentStatus;
  provider: PaymentProviderState;
  idempotency?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  CREATED = 'created',
  CONFIRMED = 'confirmed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
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

export enum OwnerDispatchStatus {
  CREATED = 'created',
  CONFIRMED = 'confirmed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface DispatchProviderState {
  id: DispatchProvider.OWNER;
  status: OwnerDispatchStatus;
  confirmation?: Confirmation;
}

export interface CreateOrder {
  reference: string;
  customer: Customer;
  transaction: Transaction;
  idempotency?: string;
}

export interface Order extends CreateOrder {
  id: string;
  status: OrderStatus;
  provider: DispatchProviderState;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDevice {
  token: string;
  userId: string;
}

export interface Device extends CreateDevice {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
