import RestClient from '../rest-client';

class AuthSafeUrlClient extends RestClient<any> {}

export default new AuthSafeUrlClient('mercadopago/authorization/safe-url');
