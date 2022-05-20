import { Setter, Signal } from "solid-js";

export const wireSignal = <Sig extends Signal<{}>>(signal: Sig) =>
  [() => signal[0](), (setStateAction) => signal[1](setStateAction)] as Sig;

export const signalExtender = <Sig extends Signal<{}>>(signal: Sig) => ({
  extend<Extension, ExtendedSignal = [Sig[0], Sig[1] & Extension]>(
    extension: (signal: ExtendedSignal) => Extension,
    createBaseSetter?: (signal: ExtendedSignal) => Sig[1]
  ) {
    if (createBaseSetter) {
      // Pass signal with extensions before reassigning to baseSetter to prevent self call
      const signalWithoutNewBase = [signal[0], ((setStateAction) => setterWithoutNewBase(setStateAction))] as Sig as unknown as ExtendedSignal
      const setterWithoutNewBase = Object.assign(
        signal[1],
        extension(signalWithoutNewBase)
      );
      signal[1] = Object.assign(
        createBaseSetter(signalWithoutNewBase),
        signal[1]
      );
    }

    signal[1] = Object.assign(
      signal[1],
      // If createBaseSetter, extensions must be reassigned to wired signals to keep valid references
      extension(wireSignal(signal) as unknown as ExtendedSignal)
    );
    return signal as unknown as ExtendedSignal;
  },
});
