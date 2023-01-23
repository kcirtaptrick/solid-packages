import { createContext, JSX } from "solid-js";
import {
  ComponentFromLazy,
  OverlayEntry,
  OverlaysSchema,
  PropsFromLazy,
} from "./types";

export default function createOverlaysContext<
  Overlays extends OverlaysSchema,
  Contexts extends { push?: any; render?: any }
>() {
  return createContext({
    push<Key extends keyof Overlays>(
      key: Key,
      props: PropsFromLazy<Overlays[Key]>,
      context?: Contexts["push"]
    ): {
      returnValue: Promise<
        ComponentFromLazy<Overlays[Key]>["returnValueSchema"]
      >;
    } {
      throw new Error(
        `OverlaysContext: Attempted to push overlay outside of OverlayContextProvider`
      );
    },
    removeAll(): void {
      throw new Error(
        "OverlaysContext: Attempted to remove all overlays outside of OverlayContextProvider"
      );
    },
    stack: () => [] as OverlayEntry<Overlays>[],
    current: () => ({ id: -1, index: -1 }),
    render(context: Contexts["render"]): JSX.Element {
      return null;
    },
  });
}
