export * from "./signals";
export * from "./utils";

import { createSignal } from "solid-js";
export type ExtendedSignal<
  T,
  Extensions extends [{}, {}]
> = createSignal.Extended<T, Extensions>;
