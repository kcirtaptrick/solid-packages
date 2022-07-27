import { Signal } from "solid-js";

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
    return signal as unknown as ExtendedSignal;
  },
});
