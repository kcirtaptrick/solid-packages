// Solid
declare global {
  module "solid-js" {
    import { Signal, Accessor, Setter } from "solid-js";
    import { SignalOptions } from "solid-js/types/reactive/signal";

    namespace createSignal {
      export type Type<T> = (value: T, options?: SignalOptions<T>) => Signal<T>;
      export type Extended<T, Extensions extends [{}, {}]> = (
        value: T,
        options?: SignalOptions<T>
      ) => [Accessor<T> & Extensions[0], Setter<T> & Extensions[1]];
      export namespace Extended {
        type Result<T, Extensions extends [{}, {}]> = ReturnType<
          Extended<T, Extensions>
        >;
      }
    }
  }
}

type NoInfer<T> = [T][T extends any ? 0 : never];
