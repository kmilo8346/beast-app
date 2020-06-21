import RestClient from './rest-client';

class PaymentMethodClient extends RestClient<{ [key: string]: any }> {}

export default new PaymentMethodClient('payment-methods');
