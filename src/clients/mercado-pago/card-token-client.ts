import RestClient from '../rest-client';

class CardTokenClient extends RestClient<any> {}

export default new CardTokenClient('mercadopago/card-tokens');
