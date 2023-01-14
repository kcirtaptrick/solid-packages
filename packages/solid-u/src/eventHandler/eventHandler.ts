import { JSX } from "solid-js";

export default function eventHandler<Elem, Ev extends Event>(
  onEvent: JSX.EventHandlerUnion<Elem, Ev> | undefined
): JSX.EventHandler<Elem, Ev> {
  if (!onEvent) return () => {};

  if ("0" in onEvent) return (e) => onEvent[0](onEvent[1], e);

  return onEvent;
}
