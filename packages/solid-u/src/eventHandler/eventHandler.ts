import { ComponentProps, JSX, ValidComponent } from "solid-js";

export default function eventHandler<Elem, Ev extends Event>(
  onEvent: JSX.EventHandlerUnion<Elem, Ev> | undefined
): JSX.EventHandler<Elem, Ev> {
  if (!onEvent) return () => {};

  if (typeof onEvent === "function") return onEvent;

  return (e) => onEvent[0](onEvent[1], e);
}

export type EventFrom<
  T extends ValidComponent,
  E extends Extract<keyof ComponentProps<T>, `on${string}`>
> = Parameters<ComponentProps<T>[E]>[0];
