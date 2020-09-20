import RestClient from '../rest-client';

class OauthTokenClient extends RestClient<any, any> {}

export default new OauthTokenClient('mercadopago/oauth/token');
