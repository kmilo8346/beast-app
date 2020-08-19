// cache
import Cache from './cache';
// types
import { Store } from '../types';

class StoreCache extends Cache<Store> {}

export default new StoreCache();
