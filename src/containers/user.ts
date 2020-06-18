import { createContainer } from 'unstated-next';

import useContainer from './container';
import { Place, User, Payment } from '../types';

const STORAGE_KEY = 'user';

export interface UserContainer {
  setCurrentAddress: (address: Place) => void;
  setAddresses: (addresses: Place[]) => void;
  setUser: (user: User) => void;
  getCurrentAddress: () => Place;
  getAddresses: () => Place[];
  getUser: () => User;
  setPayments: (payments: Payment[]) => void;
  setCurrentPayment: (payment: Payment) => void;
  getPayments: () => Payment[];
  getCurrentPayment: () => Payment;
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

    // Payment
    const defautPayment: Payment = {
      id: 'cash',
      type: 'Efectivo',
      cardNumber: '',
      cardHolder: '',
      validDate: '',
    };

    const setPayments = (payments: Payment[]): void => {
      return container.set('payments', payments);
    };

    const setCurrentPayment = (payment: Payment): void => {
      return container.set('currentPayment', payment);
    };

    const getPayments = (): Payment[] => {
      return container.get('payments') || [defautPayment];
    };

    const getCurrentPayment = (): Payment => {
      return container.get('currentPayment') || defautPayment;
    };

    return {
      setCurrentAddress,
      setAddresses,
      setUser,
      getCurrentAddress,
      getAddresses,
      getUser,
      setPayments,
      setCurrentPayment,
      getPayments,
      getCurrentPayment,
    };
  }
);
