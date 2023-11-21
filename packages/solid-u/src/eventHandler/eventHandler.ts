import { ComponentProps, JSX, ValidComponent } from "solid-js";

export default function eventHandler<T extends Event.HandlerUnion.Any>(
  onEvent: T
): (
  e: Event.FromHandlerUnion<T>
) => ReturnType<Extract<T, (...args: any[]) => any>> | void {
  if (!onEvent) return () => {};

  if (typeof onEvent === "function") return onEvent;

  return (e) => onEvent[0](onEvent[1], e);
}

export declare namespace Event {
  namespace HandlerUnion {
    type Any = JSX.EventHandlerUnion<any, any> | undefined;
  }

  type FromHandlerUnion<T extends HandlerUnion.Any> = Parameters<
    Extract<T, (...args: any[]) => any>
  >[0];
  type FromComponent<
    T extends ValidComponent,
    E extends Extract<keyof ComponentProps<T>, `on${string}`>
  > = FromHandlerUnion<ComponentProps<T>[E]>;
}
