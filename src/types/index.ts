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
  mercadopagoCustomerId: string;
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
  email: string | null;
  customerId: string | null;
  identificationType: 'RUT';
  identificationNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  phoneVerified: boolean;
  photoURL: string | null;

  currentAddress: Place | null;
  addresses: Place[];
  currentCard: Card | null | undefined;
  cards: Card[];

  metaData: { [key: string]: any };

  // trick for dot notation used in firestore
  [key: string]: any;
}

export interface CreateParams<T> {
  pathVars?: { [key: string]: any };
  body: T;
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
