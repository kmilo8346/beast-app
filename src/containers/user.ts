import { createContainer } from "unstated-next";

import useContainer from "./container";

const STORAGE_KEY = "user";

export interface Address {
  street: string,
  number: string,
  apartment?: string,
}

export interface User {
  currentAddress: Address,
  addresses: Address[],
}

export interface UserContainer {
  setCurrentAddress: (address: Address) => void,
  setAddresses: (addresses: Address[]) => void,
  getCurrentAddress: () => Address,
  getAddresses: () => Address[],
  getUser: () => User
}

export default createContainer((): UserContainer => {
  const container = useContainer(STORAGE_KEY);

  const setCurrentAddress = (address: Address): void => {
    return container.set("currentAddress", address);
  }

  const setAddresses = (addresses: Address[]): void => {
    return container.set("addresses", addresses);
  }

  const getCurrentAddress = (): Address => {
    return container.get("currentAddress");
  }

  const getAddresses = (): Address[] => {
    return container.get("addresses");
  }

  const getUser = (): User => {
    return container.getAll() as User;
  }

  return { setCurrentAddress, setAddresses, getCurrentAddress, getAddresses, getUser };
});