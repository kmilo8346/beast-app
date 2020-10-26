import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// cache
import userCache from './user';
import PendingSellerOrdersCache from './pending-seller-orders-cache';
// types
import { User } from '../types';

let ref_user: string | undefined;
let ref_cache: PendingSellerOrdersCache | undefined;

export default function usePendingSellerOrdersCache() {
  const [user, setUser] = useState<User | undefined>();
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [cache, setCache] = useState<PendingSellerOrdersCache | undefined>();

  const instanceCache = async (user: string) => {
    if (user === ref_user && ref_cache) {
      setCache(ref_cache);
      return;
    }
    const cache = new PendingSellerOrdersCache(user);
    await cache.startListening();
    ref_user = user;
    ref_cache = cache;
    setCache(cache);
  };

  useEffect(() => {
    const appStateChangeHandler = (state: AppStateStatus) => {
      setActive(state === 'active');
    };

    AppState.addEventListener('change', appStateChangeHandler);

    return () => {
      AppState.removeEventListener('change', appStateChangeHandler);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = userCache.onChange((user) => {
      setUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (active && user?.id) {
      instanceCache(user.id);
    } else {
      cache && cache.stopListening();
      setCache(undefined);
    }
  }, [active, user?.id]);

  return cache;
}
