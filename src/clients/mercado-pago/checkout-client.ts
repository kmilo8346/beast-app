import RestClient from '../rest-client';
// types
import { CreateMercadoPagoCheckout } from '../../types';

class CheckoutClient extends RestClient<any, CreateMercadoPagoCheckout> {}

export default new CheckoutClient('mercadopago/checkout');
