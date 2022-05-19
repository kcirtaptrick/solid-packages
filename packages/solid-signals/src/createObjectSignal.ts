import { createSignal, Signal } from "solid-js";
import { SignalOptions } from "solid-js/types/reactive/signal";

declare namespace createObjectSignal {
  export type Type<T extends Record<any, any>, Base = {}> = createSignal.ExtendedSetter<
    T,
    Base &
    {
      update(updates: Partial<T>): void;
    }
  >;

  export type Result<T extends Record<any, any>, Base = {}> = ReturnType<Type<T, Base>>;
}

function createObjectSignal<T extends Record<any, any>>(
  value: T,
  options?: SignalOptions<T>
) {
  return createObjectSignal.wrap(createSignal(value, options));
}

createObjectSignal.wrap = <Sig extends Signal<Record<any, any>>>([
  state,
  setState,
]: Sig) => {
  type T = Sig extends Signal<infer T> ? T : never;

  const setObjectState = Object.assign(setState, {
    update(updates: Partial<T>) {
      setState({ ...(state() as any), ...updates });
    },
  });

  type Base = Sig extends createSignal.ExtendedSetter.Result<T, infer E> ? E : {};

  return [state, setObjectState] as createObjectSignal.Result<T, Base>;
};

export default createObjectSignal;


