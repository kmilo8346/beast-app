import { createContainer } from 'unstated-next';

import useContainer from './container';
import { Place, User } from '../types';

const STORAGE_KEY = 'user';

export interface UserContainer {
  setCurrentAddress: (address: Place) => void;
  setAddresses: (addresses: Place[]) => void;
  setUser: (user: User) => void;
  getCurrentAddress: () => Place;
  getAddresses: () => Place[];
  getUser: () => User;
}

export default createContainer(
  (): UserContainer => {
    const container = useContainer(STORAGE_KEY);

    const setCurrentAddress = (address: Place): void => {
      return container.set('currentAddress', address);
    };

    const setAddresses = (addresses: Place[]): void => {
      return container.set('addresses', addresses);
    };

    const setUser = (user: User): void => {
      return container.setAll(user);
    };

    const getCurrentAddress = (): Place => {
      return container.get('currentAddress');
    };

    const getAddresses = (): Place[] => {
      return container.get('addresses');
    };

    const getUser = (): User => {
      return container.getAll() as User;
    };

    return {
      setCurrentAddress,
      setAddresses,
      setUser,
      getCurrentAddress,
      getAddresses,
      getUser,
    };
  }
);
