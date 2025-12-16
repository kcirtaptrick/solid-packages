import {
  ComponentProps,
  createContext,
  getOwner,
  Owner,
  useContext,
} from "solid-js";
import { OpenArgs, OpenResult } from "./OverlaysContext";
import { LayoutComponent, OverlayComponent, OverlaysSchema } from "../types";

type OverlayInstanceContext<
  Overlays extends OverlaysSchema,
  DefaultLayoutType extends LayoutComponent,
  OpenContext,
> =
  | (<ComponentType extends OverlayComponent>(
      owner: Owner,
      Component: ComponentType,
    ) => {
      close(result?: ComponentType["defaultResult"]): void;
      updateOwnProps(props: Partial<ComponentProps<ComponentType>>): void;
      openSelf: ((
        props?: ComponentProps<ComponentType>,
        context?: OpenContext,
      ) => OpenResult<ComponentType>) & {
        keyOnly(
          ...[props, context]: OpenArgs<
            ComponentProps<ComponentType>,
            OpenContext
          >
        ): OpenResult<ComponentType>;
      };
      onClose(handler: (result: ComponentType["defaultResult"]) => void): void;

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

  const { close, openSelf, index } = context(getOwner()!, null as any);
  return {
    close: close as () => void,
    openSelf: openSelf as () => void,
    index,
  };
};
