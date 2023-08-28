import { Component, ComponentProps, Context, ValidComponent } from "solid-js";

export type OverlayConfig<RenderContext = unknown> = {
  // Prevent modal from rendering until desired state is loaded. This allows you
  // to omit common state validation in your modals, e.g. checking if user is
  // authenticated
  validateRenderContext?(context: RenderContext): boolean;
  // Defaults to "allow"
  duplicateBehavior?: "allow" | "replace" | "remove";
  // Defaults to "none"
  limit?: "none" | "once-per-session";
};

export type LayoutComponent = Component<any> & {
  Backdrop?: BackdropComponent;
};

export type BackdropComponent = Component<any>;

export type OverlayComponent = Component<any> & {
  Layout?: LayoutComponent;
  config?: OverlayConfig;
  returnValueSchema?: any;
};

export type LazyOverlayImport = () => Promise<{ default: OverlayComponent }>;

export type OverlaysSchema = Record<string, LazyOverlayImport>;

export type ModuleFromLazy<T extends LazyOverlayImport> = Awaited<
  ReturnType<T>
>;

export type ComponentFromLazy<T extends LazyOverlayImport> =
  ModuleFromLazy<T>["default"];

export type PropsFromLazy<T extends LazyOverlayImport> = ComponentProps<
  ComponentFromLazy<T>
>;

export type Id = number;

export type OverlayEntry<
  Overlays extends OverlaysSchema,
  Key extends keyof Overlays = keyof Overlays,
> = readonly [key: Key, id: Id, props: PropsFromLazy<Overlays[Key]>];

export type ContextType<T extends Context<any>> = T extends Context<infer C>
  ? C
  : never;
