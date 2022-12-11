import { Signal, untrack } from "solid-js";

export const wireSignal = <Sig extends Signal<{}>>(signal: Sig) =>
  [
    new Proxy(() => signal[0](), {
      get: (_, key: any) => (signal[0] as any)[key],
    }),
    new Proxy((setStateAction) => signal[1](setStateAction), {
      get: (_, key: any) => (signal[1] as any)[key],
    }),
  ] as Sig;

export const signalExtender = <Sig extends Signal<{}>>(signal: Sig) => ({
  extend<
    Extensions extends [{}, {}],
    ExtendedSignal extends Signal<{}> = Sig & Extensions
  >(
    extensions: (signal: ExtendedSignal) => Extensions,
    createBaseSetter?: (signal: ExtendedSignal) => Sig[1]
  ) {
    if (createBaseSetter)
      signal[1] = (() => {
        // Pass signal with extensions before reassigning to baseSetter to prevent self call
        const signalWithoutNewBase = [
          signal[0],
          () => {
            // To be reassigned
            throw new Error(
              "Cannot call setter immediately in .extend callback, must be used in extension"
            );
          },
        ] as unknown as ExtendedSignal;

        const [extendedGet, extendedSet] = extensions(
          wireSignal(signalWithoutNewBase)
        );

        Object.assign(signal[0], extendedGet);
        const setterWithoutNewBase = Object.assign(signal[1], extendedSet);

        signalWithoutNewBase[1] = setterWithoutNewBase;

        return Object.assign(createBaseSetter(signalWithoutNewBase), signal[1]);
      })();
    else
      extensions(wireSignal(signal) as any).forEach((value, i) => {
        Object.assign(signal[i], value);
      });

    // Must use mutation instead of creating new array to keep reference for wireSignal
    signal[1] = untrackDeep(signal[1]);
    return signal as unknown as ExtendedSignal;
  },
});

const untrackDeep = <Target extends {}>(target: Target) => {
  return new Proxy(target, {
    apply(target, _this, args) {
      if (typeof target !== "function")
        throw new Error(
          `Target is not callable, called with ${args.join(", ")}`
        );

      return untrack(() => target(...args));
    },
    get(target, p): any {
      if (!(p in target))
        throw new Error(
          `Property ${
            // Symbol casting
            String(p)
          } does not exist in Target`
        );

      return untrackDeep((target as any)[p]);
    },
  });
};

export type NativeMutators<T, Methods extends keyof T> = {
  [Method in Methods]: T[Method];
};

export const getNativeExtensions = <T, Methods extends keyof T>(
  makeCopy: () => T,
  setState: (state: T) => void,
  mutators: readonly Methods[]
) =>
  Object.fromEntries(
    mutators.map(<Method extends Methods>(method: Method) => [
      method,
      (...args: T extends (...args: infer Args) => any ? Args : never) => {
        const s = makeCopy();

        // @ts-expect-error
        const res = s[method](...args);
        setState(s);

        return res;
      },
    ])
  ) as unknown as NativeMutators<T, Methods>;
