import RestClient from './rest-client';
import { Product, Service } from '../types';

class ProductClient extends RestClient<Product | Service, {}> {}

export default new ProductClient('/stores/:storeId/products');
