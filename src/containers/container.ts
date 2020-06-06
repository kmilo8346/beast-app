import { useState, useEffect, useRef } from "react";
import { AsyncStorage } from "react-native";

const STORAGE_KEY = "@global";

export interface Container {
  set: (key: string, value: any) => void,
  setAll: (state: { [key: string]: any; }) => void,
  get: (key: string) => any,
  getAll: () => { [key: string]: any; },
  has: (key: string) => boolean,
  remove: (key: string) => void,
  clear: () => void,
}

export default function useContainer(path: string): Container {
  let [state, setState] = useState<{ [key: string]: any; }>({});

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
    const raw: string | null = await AsyncStorage.getItem(storagePath);
    if (raw) {
      setState(JSON.parse(raw));
    }

  }

  async function save() {
    await AsyncStorage.setItem(storagePath, JSON.stringify(state));
  }

  function set(key: string, value: any) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }

  function setAll(state: { [key: string]: any; }) {
    setState(state);
  }

  function remove(key: string) {
    set(key, null);
  }

  function clear() {
    setState({});
  }

  function get(key: string) {
    return state[key];
  }

  function getAll() {
    return state;
  }

  function has(key: string) {
    return key in state;
  }

  return { set, setAll, get, getAll, has, remove, clear };
}
