import { useState, useEffect, useRef } from "react";
import { AsyncStorage } from "react-native";

const STORAGE_KEY = "@global";

export default function useStorage(path) {
  let [state, setState] = useState({});

  const storagePath = `${STORAGE_KEY}/${path}`;
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      load();
    } else {
      save();
    }
  }, [state]);

  async function load() {
    const raw = await AsyncStorage.getItem(storagePath);
    setState(JSON.parse(raw));
  }

  async function save() {
    await AsyncStorage.setItem(storagePath, JSON.stringify(state));
  }

  function set(key, value) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }

  function setAll(state) {
    setState(state);
  }

  function remove(key) {
    set(key, null);
  }

  function clear() {
    setState({});
  }

  function get(key) {
    return state[key];
  }

  function getAll() {
    return state;
  }

  function has(key) {
    return key in state;
  }

  return { set, setAll, get, getAll, has, remove, clear };
}
