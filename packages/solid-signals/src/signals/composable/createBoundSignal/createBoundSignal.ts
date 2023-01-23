import {
  Accessor,
  createComputed,
  createSignal,
  Setter,
  Signal,
} from "solid-js";
import { signalExtender, SolidSignal } from "../../../utils/signal.js";

declare namespace createBoundSignal {
  export type Extensions<T> = [{}, {}];
  export type Type<
    T extends {},
    Base extends [{}, {}] = [{}, {}]
  > = SolidSignal.Extended<T, Base & Extensions<T>>;
  export type ToBeBound<T> = [
    value: (() => T) | undefined,
    onChange?: ((value: T) => void) | undefined
  ];
  export type Result<
    T extends {},
    Base extends [{}, {}] = [{}, {}]
  > = ReturnType<Type<T, Base>>;
}

function createBoundSignal<T extends {}>(
  value: T,
  toBeBound: createBoundSignal.ToBeBound<T>,
  options?: SolidSignal.Options<T>
) {
  return createBoundSignal.wrap(createSignal(value, options), toBeBound);
}

createBoundSignal.wrap = <
  Sig extends Signal<{}>,
  T extends {} = Sig extends Signal<infer T> ? T : never
>(
  signal: Sig,
  [value, onChange]: createBoundSignal.ToBeBound<T>
) => {
  if (value) signal[0] = Object.assign(value, signal[0]);

  const [state, setState] = signalExtender(signal).extend<
    createBoundSignal.Extensions<T>
  >(
    () => [{}, {}],
    ([state, setState]) =>
      (setStateAction) => {
        const value =
          typeof setStateAction === "function"
            ? (setStateAction as any)(state())
            : setStateAction;

        console.log("value", value);

        onChange?.(value);

        return setState(value);
      }
  );

  // Special handling for createHistory, think about generalizing this, maybe
  // setState.reinit
  // @ts-expect-error
  if ("history" in setState) setState.history([state()]);

  return [state, setState] as Sig & createBoundSignal.Result<T>;
};

export default createBoundSignal;
