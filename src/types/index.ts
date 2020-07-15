export interface IntegerRange {
  lte: number;
  gte: number;
}

export interface Circle {
  center: Place;
  radius: string;
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

export interface Store {
  id: string;
  version: number;
  name: string | undefined;
  phone: string | undefined;
  images: string[] | undefined;
  deliveryTime: IntegerRange | undefined;
  deliveryArea: Circle | undefined;
  openingHours: OpeningHours | undefined;
  sellerCredentials: SellerCredentials | undefined;
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
    viewport: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
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
  photoURL: string | undefined;
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

export interface CreateParams<T> {
  pathVars?: { [key: string]: any };
  body: Omit<T, 'id'>;
  source?: string[];
}

export interface UpdateParams<T> {
  pathVars?: { [key: string]: any };
  body: Partial<T>;
  source?: string[];
}

export interface GetParams {
  pathVars: {
    [key: string]: any;
  };
  source?: string[];
}

export interface GetAllParams {
  pathVars?: { [key: string]: any };
  from: number;
  size: number;
  source?: string[];
}

export interface SearchParams {
  pathVars?: { [key: string]: any };
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

export interface PlacesAutocompletePrediction {
  description: string;
  placeId: string;
}

export interface PlacesAutocompletResponse {
  predictions: PlacesAutocompletePrediction[];
}

export type PlacesDetailsResponse = Place;
