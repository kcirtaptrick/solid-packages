import { JSX } from "solid-js";

export default function handleEvent<Elem, Ev extends Event>(
  onEvent: JSX.EventHandlerUnion<Elem, Ev> | undefined,
  e: Ev & { currentTarget: Elem; target: Element }
) {
  if (!onEvent) return;

  if ("0" in onEvent) onEvent[0](onEvent[1], e);
  else onEvent(e);
}
