// Solid
declare global {
  module "solid-js" {
    import { Signal, Accessor, Setter } from "solid-js";

    namespace createSignal {
      export type Options<T> = {
        name?: string;
        equals?(prev: T, next: T): boolean;
        internal?: boolean;
      };
      export type Type<T> = (value: T, options?: Options<T>) => Signal<T>;
      export type Extended<T, Extensions extends [{}, {}]> = (
        value: T,
        options?: Options<T>
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
