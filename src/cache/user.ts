// cache
import PersistedCache from './persisted-cache';
// types
import { User, LoggedUser } from '../types';

class UserCache extends PersistedCache<User> {
  isLogged() {
    return (this.data as LoggedUser).email !== undefined;
  }
}

export default new UserCache('user');
