import RestClient from './rest-client';
import { Payment, CreatePayment } from '../types';

class PaymentClient extends RestClient<Payment, CreatePayment> {}

export default new PaymentClient('/payments');
