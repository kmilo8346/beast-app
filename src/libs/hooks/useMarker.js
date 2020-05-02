import { useEffect } from "react";
import { Bag } from "../../containers";

// TODO: change name
export default function useMarker(screen) {
  const bag = Bag.useContainer();

  useEffect(() => {
    bag.set("navigation_state", screen);
  }, []);
}
