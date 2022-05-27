import { Signal } from "solid-js";

export const wireSignal = <Sig extends Signal<{}>>(signal: Sig) =>
  [
    () => signal[0](),
    new Proxy((setStateAction) => signal[1](setStateAction), {
      get(_, key: any) {
        return (signal[1] as any)[key];
      },
    }),
  ] as Sig;

export const signalExtender = <Sig extends Signal<{}>>(signal: Sig) => ({
  extend<
    Extension,
    ExtendedSignal extends Signal<{}> = [Sig[0], Sig[1] & Extension]
  >(
    extension: (signal: ExtendedSignal) => Extension,
    createBaseSetter?: (signal: ExtendedSignal) => Sig[1]
  ) {
    signal[1] = createBaseSetter
      ? (() => {
          // Pass signal with extensions before reassigning to baseSetter to prevent self call
          const signalWithoutNewBase = [
            signal[0],
            () => {
              // To be reassigned
              throw new Error("Cannot call setter in extensions creator");
            },
          ] as unknown as ExtendedSignal;
          const setterWithoutNewBase = Object.assign(
            signal[1],
            extension(wireSignal(signalWithoutNewBase))
          );
          signalWithoutNewBase[1] = setterWithoutNewBase;

          return Object.assign(
            createBaseSetter(signalWithoutNewBase),
            signal[1]
          );
        })()
      : Object.assign(signal[1], extension(wireSignal(signal) as any));
    return signal as unknown as ExtendedSignal;
  },
});
