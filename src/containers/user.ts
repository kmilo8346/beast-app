import { createContainer } from 'unstated-next';

import useContainer from './container';
import { Place, User, Card } from '../types';

const STORAGE_KEY = 'user';

export interface UserContainer {
  setCurrentAddress: (address: Place) => void;
  setAddresses: (addresses: Place[]) => void;
  setUser: (user: User) => void;
  getCurrentAddress: () => Place;
  getAddresses: () => Place[];
  getUser: () => User;
  getCards: () => Card[];
  getCurrentCard: () => Card | null | undefined;
  addCard: (card: Card) => Card[];
  deleteCard: (id: string) => void;
  setCurrentCard: (id: string | null) => void;
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

    const setCurrentCard = (id: string | null): void => {
      if (id === null) {
        container.set('currentCard', null);
        return;
      }
      const match = getCards().find((card) => card.id === id);
      container.set('currentCard', match);
    };

    return {
      setCurrentAddress,
      setAddresses,
      setUser,
      getCurrentAddress,
      getAddresses,
      getUser,
      addCard,
      deleteCard,
      setCurrentCard,
      getCards,
      getCurrentCard,
    };
  }
);
