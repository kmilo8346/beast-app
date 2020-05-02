import { createContainer } from "unstated-next";

import useStorage from "./container";

const STORAGE_KEY = "bag";

export default createContainer(() => {
  const storage = useStorage(STORAGE_KEY);

  return { set: storage.set, get: storage.get };
});
