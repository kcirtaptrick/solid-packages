import { Setter, Signal } from "solid-js";

export const wireSignal = <Sig extends Signal<{}>>(signal: Sig) =>
  [() => signal[0](), (setStateAction) => signal[1](setStateAction)] as Sig;

export const signalExtender = <Sig extends Signal<{}>>(signal: Sig) => ({
  extend<Extension>(
    extension: (signal: [Sig[0], Sig[1] & Extension]) => Extension,
    baseSetter?: Sig[1]
  ) {
    signal[1] = Object.assign(
      ...((baseSetter ? [baseSetter] : []) as [Sig[1]]),
      signal[1],
      extension
    );
    return signal as unknown as [Sig[0], Sig[1] & Extension];
  },
});
