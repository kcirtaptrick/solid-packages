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

export type OpenArgs<Props, Context> = RequiredKeys<Props> extends never
  ? [props?: Props, context?: Context]
  : [props: Props, context?: Context];

export type OpenResult<Component extends OverlayComponent> = {
  result: Promise<Component["defaultResult"]>;
  componentLoad: Promise<void>;
  close(result?: Component["defaultResult"]): void;
};

type OverlaysContext<
  Overlays extends OverlaysSchema,
  Contexts extends { open?: any; render?: any },
> =
  | {
      open<Key extends keyof Overlays>(
        key: Key,
        ...[props, context]: OpenArgs<
          PropsFromLazy<Overlays[Key]>,
          Contexts["open"]
        >
      ): OpenResult<ComponentFromLazy<Overlays[Key]>>;
      closeAll(): void;
      closeCurrent(): void;
      stack(): OverlayEntry<Overlays>[];
      current(): { id: number; index: number };
      render(context?: Contexts["render"]): JSX.Element;
    }
  | undefined;

const OverlaysContext = createContext<OverlaysContext<any, any>>();

export default OverlaysContext;
