import RestClient from './rest-client';

class CardClient extends RestClient<any> {}

export default new CardClient('customers/:customerId/cards');
