import { createContext, JSX } from "solid-js";
import {
  ComponentFromLazy,
  OverlayComponent,
  OverlayEntry,
  OverlaysSchema,
  PropsFromLazy,
} from "../types";

type RequiredKeys<T> = {
  [Key in keyof T]-?: {} extends Pick<T, Key> ? never : Key;
}[keyof T];

export type PushArgs<Props, Context> = RequiredKeys<Props> extends never
  ? [props?: Props, context?: Context]
  : [props: Props, context?: Context];

export type PushResult<Component extends OverlayComponent> = {
  returnValue: Promise<Component["returnValueSchema"]>;
  componentLoad: Promise<void>;
};

export default function createOverlaysContext<
  Overlays extends OverlaysSchema,
  Contexts extends { push?: any; render?: any },
>() {
  return createContext({
    push<Key extends keyof Overlays>(
      key: Key,
      ...[props, context]: PushArgs<
        PropsFromLazy<Overlays[Key]>,
        Contexts["push"]
      >
    ): PushResult<ComponentFromLazy<Overlays[Key]>> {
      throw new Error(
        `OverlaysContext: Attempted to push overlay outside of OverlaysProvider`,
      );
    },
    removeAll(): void {
      throw new Error(
        "OverlaysContext: Attempted to remove all overlays outside of OverlaysProvider",
      );
    },
    stack: () => [] as OverlayEntry<Overlays>[],
    current: () => ({ id: -1, index: -1 }),
    render(context?: Contexts["render"]): JSX.Element {
      return null;
    },
  });
}
