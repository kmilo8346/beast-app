import RestClient from './rest-client';
import { Store, CreateStore } from '../types';

class StoreClient extends RestClient<Store, CreateStore> {}

export default new StoreClient('stores');
