import { ComponentProps, createContext } from "solid-js";
import {
  ComponentFromLazy,
  LayoutComponent,
  OverlayComponent,
  OverlaysSchema,
  PropsFromLazy,
} from "./types";

export default function createOverlayComponentContext<
  Overlays extends OverlaysSchema,
  DefaultLayoutType extends LayoutComponent,
  PushContext
>() {
  return createContext(
    <ComponentType extends OverlayComponent>(Component: ComponentType) => ({
      removeSelf(returnValue?: ComponentType["returnValueSchema"]): void {
        throw new Error(
          "OverlaysContext: Attempted to remove self outside of OverlayContextComponentProvider"
        );
      },
      updateOwnProps(props: Partial<ComponentProps<ComponentType>>): void {
        throw new Error(
          "OverlaysContext: Attempted to set own props outside of OverlayContextComponentProvider"
        );
      },
      pushSelf(
        props: ComponentProps<ComponentType>,
        context?: PushContext
      ): {
        returnValue: Promise<ComponentType["returnValueSchema"]>;
      } {
        throw new Error(
          "OverlaysContext: Attempted to push self outside of OverlayContextComponentProvider"
        );
      },
      withLayoutProps(
        props: () => Partial<
          ComponentProps<
            ComponentType["Layout"] extends LayoutComponent
              ? ComponentType["Layout"]
              : DefaultLayoutType
          >
        >,
        dependencies: any[]
      ): void {
        throw new Error(
          "OverlaysContext: Attempted to set layout props outside of OverlayContextComponentProvider"
        );
      },
      withBackdropProps(
        props: () => Partial<
          ComponentProps<
            Exclude<
              (ComponentType["Layout"] extends LayoutComponent
                ? ComponentType["Layout"]
                : DefaultLayoutType)["Backdrop"],
              undefined
            >
          >
        >,
        dependencies: any[]
      ): void {
        throw new Error(
          "OverlaysContext: Attempted to set backdrop props outside of OverlayContextComponentProvider"
        );
      },
      isPresent: () => true as boolean,
      safeToRemove(): void {
        throw new Error(
          'OverlaysContext: "safeToRemove" called outside of OverlayContextComponentProvider'
        );
      },
      getRelative(delta: number): null | {
        key: keyof Overlays;
        props: PropsFromLazy<Overlays[keyof Overlays]>;
        id: number;
        Component: ComponentFromLazy<Overlays[keyof Overlays]>;
        isPresent: boolean;
      } {
        throw new Error(
          "OverlaysContext: Attempted to get relative overlay outside of OverlayContextComponentProvider"
        );
      },
      id: -1,
      index: () => -1 as number,
      isCurrent: () => false as boolean,
    })
  );
}
