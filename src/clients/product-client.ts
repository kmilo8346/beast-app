import RestClient from './rest-client';
import { Product } from '../types';

class ProductClient extends RestClient<Partial<Product>> {}

export default new ProductClient('products');
