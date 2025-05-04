import { ComponentProps, createContext, useContext } from "solid-js";
import { LayoutComponent } from "../types";

const OverlayLayoutContext = createContext(
  <LayoutType extends LayoutComponent>(Component: LayoutType) => {
    return {
      close(): void {
        throw new Error(
          "overlays: Attempted to remove self outside of OverlayLayoutContext.Provider",
        );
      },
      withBackdropProps(
        props: () => Partial<
          ComponentProps<Exclude<LayoutType["Backdrop"], undefined>>
        >,
      ): void {
        throw new Error(
          "overlays: Attempted to set backdrop props outside of OverlayLayoutContext.Provider",
        );
      },
      isPresent: () => true as boolean,
      safeToRemove(): void {
        throw new Error(
          'overlays: "safeToRemove" called outside of OverlayLayoutContext.Provider',
        );
      },
      getRelative(delta: number): null | {
        id: number;
        isPresent: boolean;
      } {
        throw new Error(
          "overlays: Attempted to get relative overlay outside of OverlayLayoutContext.Provider",
        );
      },
      id: -1,
      index: () => -1 as number,
      isCurrent: () => false as boolean,
      root: {
        current: () => ({
          index: -1,
          id: -1,
        }),
      },
    };
  },
);

export default OverlayLayoutContext;

export const useOverlayLayout = <LayoutType extends LayoutComponent>(
  Layout: LayoutType,
) => {
  return useContext(OverlayLayoutContext)(Layout);
};
