export * from "./signals/index.js";
export * from "./utils/index.js";

import { createSignal } from "solid-js";
export type ExtendedSignal<
  T,
  Extensions extends [{}, {}]
> = createSignal.Extended<T, Extensions>;
