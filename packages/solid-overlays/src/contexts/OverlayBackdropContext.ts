import { createContext, useContext } from "solid-js";

const OverlayBackdropContext = createContext({
  show: () => false as boolean,
  closeCurrent(): void {
    throw new Error(
      'overlays: "closeCurrent" called outside of OverlayBackdropContext.Provider',
    );
  },
});

export default OverlayBackdropContext;

export const useOverlayBackdrop = () => useContext(OverlayBackdropContext);
