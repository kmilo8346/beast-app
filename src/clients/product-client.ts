import { ImageSourcePropType } from 'react-native';

import RestClient from './rest-client';

interface IntegerRange {
  lte: number;
  gte: number;
}

interface Store {
  id: string;
  name: string;
  deiveryTime: IntegerRange;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  images: Array<ImageSourcePropType>;
  price: number | null;
  qty: number;
  store: Store;
  tags: string[];
}

class ProductClient extends RestClient<Partial<Product>> {}

export default new ProductClient('products');
