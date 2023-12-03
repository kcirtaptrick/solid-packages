import { createSignal, Signal } from "solid-js";
import { signalExtender, SolidSignal } from "../../../utils/signal.js";

type AnyObject = Record<any, any>;

type OptionalKeys<T> = {
  [Key in keyof T]-?: Omit<T, Key> extends T ? Key : never;
}[keyof T];

declare namespace createObject {
  export type Extensions<T> = [
    {},
    {
      /**
       * Shallow merges state with updates
       * @param updates - New properties to be set
       */
      update(updates: Partial<T> | ((state: T) => Partial<T>)): void;
      /**
       * Deletes property from object state, type only allows optional properties
       * @param property - Property key to delete
       */
      delete(property: OptionalKeys<T>): void;
    }
  ];
  export type Type<
    T extends {},
    Base extends [{}, {}] = [{}, {}]
  > = SolidSignal.Extended<T, Base & Extensions<T>>;

  export type Result<
    T extends {},
    Base extends [{}, {}] = [{}, {}]
  > = ReturnType<Type<T, Base>>;
}

function createObject<T extends AnyObject>(
  value: T,
  options?: SolidSignal.Options<T>
) {
  return createObject.wrap(createSignal(value, options));
}

createObject.wrap = <Sig extends Signal<AnyObject>>(signal: Sig) => {
  type T = Sig extends Signal<infer T> ? T : never;

  return signalExtender(signal).extend<createObject.Extensions<T>>(
    ([state, setState]) => [
      {},
      {
        update(updates) {
          setState(() => ({
            ...state(),
            // TODO: typeof state() is AnyObject, correct this to T
            ...(typeof updates === "function"
              ? updates(state() as T)
              : updates),
          }));
          return state();
        },
        delete(property) {
          setState(({ [property]: _, ...remaining }) => remaining);
        },
      },
    ]
  );
};

export default createObject;
