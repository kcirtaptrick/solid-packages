// Solid
declare global {
  declare module "solid-js" {
    import { Signal, Accessor, Setter } from "solid-js";
    import { SignalOptions } from "solid-js/types/reactive/signal";

    namespace createSignal {
      export type Type<T> = (value: T, options?: SignalOptions<T>) => Signal<T>;
      export type ExtendedSetter<T, Extension> = (
        value: T,
        options?: SignalOptions<T>
      ) => [Accessor<T>, Setter<T> & Extension];
      export namespace ExtendedSetter {
        type Result<T, Extension> = ReturnType<ExtendedSetter<T, Extension>>
      }
    }
  }
}
