import { createSignal, Setter, Signal } from "solid-js";
import { signalExtender, SolidSignal } from "../../../utils/signal.js";

type DeepSetter<T> = Setter<T> &
  (T extends {} ? { [Key in keyof T]: DeepSetter<T[Key]> } : T);

declare namespace createDeepObject {
  export type Extensions<T extends {}> = [
    {},
    {
      deep: DeepSetter<T>;
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

function createDeepObject<T extends {}>(
  value: T,
  options?: SolidSignal.Options<T>
) {
  return createDeepObject.wrap(createSignal(value, options));
}

createDeepObject.wrap = <Sig extends Signal<{}>>(signal: Sig) => {
  type T = Sig extends Signal<infer T> ? T : never;

  return signalExtender(signal).extend<createDeepObject.Extensions<T>>(
    ([state, setState]) => [
      {},
      {
        deep: (function deep(path: string[] = []): any {
          return new Proxy(() => {}, {
            apply(_target, _this, [setStateAction]) {
              const value =
                typeof setStateAction === "function"
                  ? (setStateAction as any)(state())
                  : setStateAction;

              setState(
                (function nextValue(current: any = state(), i = 0): any {
                  if (i === path.length) return value;

                  return {
                    ...current,
                    [path[i]]: nextValue(current[path[i]], i + 1),
                  };
                })()
              );

              return value;
            },
            get: (_target, prop: string) => deep([...path, prop]),
            has: () => true,
          });
        })(),
      },
    ]
  );
};

export default createDeepObject;
