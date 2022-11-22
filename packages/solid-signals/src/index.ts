export * from "./signals/index";
export { default as signalMap } from "./signalMap";
export { signalExtender } from "./utils/signal";

import { createSignal } from "solid-js";
export type ExtendedSignal<
  T,
  Extensions extends [{}, {}]
> = createSignal.Extended<T, Extensions>;
