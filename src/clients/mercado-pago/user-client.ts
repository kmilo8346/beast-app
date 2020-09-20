import RestClient from '../rest-client';

class UserClient extends RestClient<any, any> {}

export default new UserClient('mercadopago/users');
