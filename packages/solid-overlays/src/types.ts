import { Component, ComponentProps, Context, ValidComponent } from "solid-js";

export type OverlayConfig<RenderContext = unknown> = {
  // Defaults to "allow"
  duplicateBehavior?: "allow" | "replace" | "remove";
  validateRenderContext?(context: RenderContext): boolean;
};

export type LayoutComponent = Component<any> & {
  Backdrop?: Component<any>;
};

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
  Key extends keyof Overlays = keyof Overlays
> = readonly [key: Key, id: Id, props: PropsFromLazy<Overlays[Key]>];

export type ContextType<T extends Context<any>> = T extends Context<infer C>
  ? C
  : never;
