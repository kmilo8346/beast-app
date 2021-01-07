import RestClient from './rest-client';
import { StoreProduct } from '../types';

class StoreProductClient extends RestClient<StoreProduct, {}> {}

export default new StoreProductClient('/storeproducts');
