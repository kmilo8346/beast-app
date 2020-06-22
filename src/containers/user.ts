import { createContainer } from 'unstated-next';

import useContainer from './container';
import { Place, User, Card } from '../types';

const STORAGE_KEY = 'user';

export interface UserContainer {
  setUser: (user: User) => void;
  getUser: () => User;

  setAddresses: (addresses: Place[]) => void;
  setCurrentAddress: (address: Place | null) => void;
  getAddresses: () => Place[];
  addAddress: (newAddress: Place) => Place[];
  getCurrentAddress: () => Place | null;
  deleteAddress: (id: string) => Place[];

  getCards: () => Card[];
  getCurrentCard: () => Card | null | undefined;
  addCard: (card: Card) => Card[];
  deleteCard: (id: string) => void;
  setCurrentCard: (card: Card | null) => void;
}

export default createContainer(
  (): UserContainer => {
    const container = useContainer(STORAGE_KEY);

    // user
    const getUser = (): User => {
      return container.getAll() as User;
    };

    const setUser = (user: User): void => {
      return container.setAll(user);
    };

    // address
    const getAddresses = (): Place[] => {
      return container.get('addresses') || [];
    };

    const getCurrentAddress = (): Place | null => {
      return container.get('currentAddress') || null;
    };

    const setAddresses = (addresses: Place[]): void => {
      return container.set('addresses', addresses);
    };

    const setCurrentAddress = (address: Place | null): void => {
      container.set('currentAddress', address);
    };

    const addAddress = (newAddress: Place) => {
      let found = false;

      const addresses = getAddresses().map((address) => {
        if (address.id === newAddress.id) {
          found = true;
          return newAddress;
        }
        return address;
      });
      if (!found) {
        addresses.push(newAddress);
      }

      // set in db address
      setAddresses(addresses);
      return addresses;
    };

    const deleteAddress = (id: string): Place[] => {
      let addresses = getAddresses();
      addresses = addresses.filter((address) => address.id !== id);
      container.set('addresses', addresses);
      return addresses;
    };

    // cards
    const getCards = (): Card[] => {
      return container.get('cards') || [];
    };

    const getCurrentCard = (): Card | null | undefined => {
      return container.get('currentCard');
    };

    const addCard = (newCard: Card): Card[] => {
      let cards = getCards();
      let found = false;
      cards = cards.map((card) => {
        if (card.id === newCard.id) {
          found = true;
          return newCard;
        }
        return card;
      });
      if (!found) {
        cards.push(newCard);
      }
      // set in db cards
      container.set('cards', cards);
      return cards;
    };

    const deleteCard = (id: string): void => {
      let cards = getCards();
      cards = cards.filter((card) => card.id !== id);
      container.set('cards', cards);
    };

    const setCurrentCard = (card: Card | null): void => {
      container.set('currentCard', card);
    };

    return {
      setUser,
      getUser,
      setCurrentAddress,
      setAddresses,
      getCurrentAddress,
      getAddresses,
      addAddress,
      deleteAddress,
      addCard,
      setCurrentCard,
      getCards,
      getCurrentCard,
      deleteCard,
    };
  }
);
