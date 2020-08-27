import RestClient from './rest-client';
import { User, CreateUser } from '../types';

class UserClient extends RestClient<User, CreateUser> {}

export default new UserClient('/users');
