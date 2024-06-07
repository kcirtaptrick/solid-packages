import { ComponentProps, createContext } from "solid-js";
import { PushArgs, PushResult } from "./createOverlaysContext";
import {
  ComponentFromLazy,
  LayoutComponent,
  OverlayComponent,
  OverlaysSchema,
  PropsFromLazy,
} from "../types";

export default function createOverlayComponentContext<
  Overlays extends OverlaysSchema,
  DefaultLayoutType extends LayoutComponent,
  PushContext,
>() {
  return createContext(
    <ComponentType extends OverlayComponent>(Component: ComponentType) => {
      const makePushSelf =
        <Args extends any[]>() =>
        (...[props, context]: Args): PushResult<ComponentType> => {
          throw new Error(
            "overlays: Attempted to push self outside of OverlayComponentContext.Provider",
          );
        };

      return {
        removeSelf(result?: ComponentType["defaultResult"]): void {
          throw new Error(
            "overlays: Attempted to remove self outside of OverlayComponentContext.Provider",
          );
        },
        updateOwnProps(props: Partial<ComponentProps<ComponentType>>): void {
          throw new Error(
            "overlays: Attempted to set own props outside of OverlayComponentContext.Provider",
          );
        },
        pushSelf: Object.assign(
          makePushSelf<
            [props?: ComponentProps<ComponentType>, context?: PushContext]
          >(),
          {
            keyOnly:
              makePushSelf<
                PushArgs<ComponentProps<ComponentType>, PushContext>
              >(),
          },
        ),
        withLayoutProps(
          props: () => Partial<
            ComponentProps<
              ComponentType["Layout"] extends LayoutComponent
                ? ComponentType["Layout"]
                : DefaultLayoutType
            >
          >,
        ): void {
          throw new Error(
            "overlays: Attempted to set layout props outside of OverlayComponentContext.Provider",
          );
        },
      };
    },
  );
}
