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

export interface Payment {
  id: string;
  type: string;
  cardNumber: string;
  cardHolder: string;
  validDate: string;
}

export interface User {
  identificationType: 'RUT';
  identificationNumber: string;
  email: string;
  currentAddress: Place;
  addresses: Place[];
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

export interface PlacesAutocompletePrediction {
  description: string;
  placeId: string;
}

export interface PlacesAutocompletResponse {
  predictions: PlacesAutocompletePrediction[];
}

export type PlacesDetailsResponse = Place;
