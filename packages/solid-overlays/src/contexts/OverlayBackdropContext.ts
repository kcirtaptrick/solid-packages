import { ComponentProps, createContext, useContext } from "solid-js";
import { BackdropComponent } from "../types";

const OverlayBackdropContext = createContext({
  show: () => false as boolean,
  removeCurrent(): void {
    throw new Error(
      'overlays: "removeCurrent" called outside of OverlayBackdropContext.Provider',
    );
  },
});

export default OverlayBackdropContext;

export const useOverlayBackdrop = () => useContext(OverlayBackdropContext);
