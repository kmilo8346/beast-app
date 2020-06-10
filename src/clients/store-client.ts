import RestClient from './rest-client';
import { Store } from '../types';

class StoreClient extends RestClient<Partial<Store>> {}

export default new StoreClient('stores');
