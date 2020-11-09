import RestClient from './rest-client';
import { CreateUser, User } from '../types';

class UserClient extends RestClient<User, CreateUser> {}

export default new UserClient('/users');
