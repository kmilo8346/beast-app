import RestClient from './rest-client';
import { Product } from '../types';

class ProductClient extends RestClient<Product, {}> {}

export default new ProductClient('/stores/:storeId/products');
