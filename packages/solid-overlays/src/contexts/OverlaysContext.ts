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
  result: Promise<Component["defaultResult"]>;
  componentLoad: Promise<void>;
};

type OverlaysContext<
  Overlays extends OverlaysSchema,
  Contexts extends { push?: any; render?: any },
> =
  | {
      push<Key extends keyof Overlays>(
        key: Key,
        ...[props, context]: PushArgs<
          PropsFromLazy<Overlays[Key]>,
          Contexts["push"]
        >
      ): PushResult<ComponentFromLazy<Overlays[Key]>>;
      removeAll(): void;
      stack(): OverlayEntry<Overlays>[];
      current(): { id: number; index: number };
      render(context?: Contexts["render"]): JSX.Element;
    }
  | undefined;

const OverlaysContext = createContext<OverlaysContext<any, any>>();

export default OverlaysContext;
