import RestClient from './rest-client';

class CustomerClient extends RestClient<any> {}

export default new CustomerClient('customers');
