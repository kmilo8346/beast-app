import RestClient from './rest-client';
import { CreateShop, Shop } from '../types';

class ShopClient extends RestClient<Shop, CreateShop> {}

export default new ShopClient('/shops');
