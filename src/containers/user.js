import { createContainer } from "unstated-next";

import useStorage from "./container";

const STORAGE_KEY = "user";

export default createContainer(() => {
  const storage = useStorage(STORAGE_KEY);

  function setData(data) {
    storage.setAll(data);
  }

  function setFullName(fullName) {
    storage.set("full_name", fullName);
  }

  function setPhone(phone) {
    storage.set("phone", phone);
  }

  function setEmail(email) {
    storage.set("email", email);
  }

  function getFullName() {
    return storage.get("full_name");
  }

  function getData() {
    return storage.getAll();
  }

  return { setData, setFullName, setPhone, setEmail, getFullName, getData };
});
