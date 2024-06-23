import { ComponentProps, createContext, useContext } from "solid-js";
import { PushArgs, PushResult } from "./OverlaysContext";
import { LayoutComponent, OverlayComponent, OverlaysSchema } from "../types";

type OverlayInstanceContext<
  Overlays extends OverlaysSchema,
  DefaultLayoutType extends LayoutComponent,
  PushContext,
> =
  | (<ComponentType extends OverlayComponent>(
      Component: ComponentType,
    ) => {
      removeSelf(result?: ComponentType["defaultResult"]): void;
      updateOwnProps(props: Partial<ComponentProps<ComponentType>>): void;
      pushSelf: ((
        props?: ComponentProps<ComponentType>,
        context?: PushContext,
      ) => PushResult<ComponentType>) & {
        keyOnly(
          ...[props, context]: PushArgs<
            ComponentProps<ComponentType>,
            PushContext
          >
        ): PushResult<ComponentType>;
      };

      withLayoutProps(
        props: () => Partial<
          ComponentProps<
            ComponentType["Layout"] extends LayoutComponent
              ? ComponentType["Layout"]
              : DefaultLayoutType
          >
        >,
      ): void;
      index: () => number;
    })
  | undefined;

const OverlayInstanceContext =
  createContext<OverlayInstanceContext<any, any, any>>();

export default OverlayInstanceContext;

export const useOverlayComponent = () => {
  const context = useContext(OverlayInstanceContext);
  if (!context)
    throw new Error(
      "Attempted to call useOverlayComponent outside of OverlayInstanceContext.",
    );

  const { removeSelf, pushSelf, index } = context(null as any);
  return {
    removeSelf: removeSelf as () => void,
    pushSelf: pushSelf as () => void,
    index,
  };
};
