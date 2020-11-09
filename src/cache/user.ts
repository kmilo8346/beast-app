// cache
import PersistedCache from './persisted-cache';
// types
import { Place, User } from '../types';

class UserCache extends PersistedCache<User> {
  isLogged() {
    return this.data?.phone !== undefined;
  }

  getAddress(): Place | undefined {
    return (this.data?.addresses || []).find(
      (address) => address.id === this.data?.current_address
    );
  }
}

export default new UserCache('user');
