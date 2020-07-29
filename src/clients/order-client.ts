import RestClient from './rest-client';
import { Order, CreateOrder } from '../types';

class OrderClient extends RestClient<Order, CreateOrder> {}

export default new OrderClient('/orders');
