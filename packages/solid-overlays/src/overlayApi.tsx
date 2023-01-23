import "./polyfill";

import {
  Component,
  ComponentProps,
  createContext,
  createMemo,
  ErrorBoundary,
  For,
  JSX,
  useContext,
  on,
  createComputed,
} from "solid-js";
import createOverlayComponentContext from "./createOverlayComponentContext";
import createOverlaysContext from "./createOverlaysContext";
import {
  ContextType,
  Id,
  LayoutComponent,
  OverlayComponent,
  OverlayConfig,
  OverlayEntry,
  OverlaysSchema,
  PropsFromLazy,
} from "./types";
import {
  createArray,
  createDeepObject,
  createObject,
  createBoundSignal,
} from "solid-signals";
import { reactiveProps, splitAccessor } from "solid-u";

declare namespace overlayApi {
  export interface Options<DefaultLayoutType extends LayoutComponent> {
    DefaultLayout?: DefaultLayoutType;
  }
  interface OverlayProviderProps<Entry, PushContext> {
    data?: Entry[];
    onChange?(
      data?: OverlayProviderProps<Entry, PushContext>["data"],
      pushContext?: PushContext
    ): void;
    children:
      | JSX.Element
      | ((context: { renderOverlays(): JSX.Element }) => JSX.Element);
  }
  export namespace create {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options<
      Overlays extends OverlaysSchema,
      Context extends { push?: any; render?: any }
    > {
      hooks?: {
        push?<Key extends keyof Overlays>(
          key: Key,
          props: PropsFromLazy<Overlays[Key]>,
          context?: Context["push"]
        ): void;
      };
      defaultConfig?: OverlayConfig<Context["render"]>;
    }
  }
}

const overlayApi = <
  Overlays extends OverlaysSchema,
  DefaultLayoutType extends LayoutComponent = LayoutComponent
>(
  overlays: Overlays,
  { DefaultLayout }: overlayApi.Options<DefaultLayoutType> = {}
) => {
  const [componentByKey, setComponentByKey] = createObject<
    Partial<Record<keyof Overlays, OverlayComponent | "pending">>
  >({});

  return {
    create<
      Contexts extends { push?: any; render?: any } = {
        push?: unknown;
        render?: unknown;
      }
    >({
      hooks = {},
      defaultConfig = {},
    }: overlayApi.create.Options<Overlays, Contexts>) {
      const OverlaysContext = createOverlaysContext<Overlays, Contexts>();
      const OverlayComponentContext = createOverlayComponentContext<
        Overlays,
        DefaultLayoutType,
        Contexts["push"]
      >();
      const OverlayBackdropContext = createContext({
        show: () => false as boolean,
        removeCurrent() {},
      });

      const useOverlaysController = () => {
        const { push, removeAll } = useContext(OverlaysContext);
        return { push, removeAll };
      };

      const useOverlaysBase = () => {
        const { render, stack } = useContext(OverlaysContext);
        return { render, stack };
      };

      const useOverlayBackdrop = () => useContext(OverlayBackdropContext);

      const useOverlay = <ComponentType extends OverlayComponent>(
        Component: ComponentType
      ) => {
        const {
          removeSelf,
          updateOwnProps,
          pushSelf,
          withLayoutProps,
          withBackdropProps,
        } = useContext(OverlayComponentContext)<ComponentType>(Component);

        return {
          removeSelf,
          updateOwnProps,
          pushSelf,
          withLayoutProps,
          withBackdropProps,
        };
      };

      const useOverlayLayout = () => {
        const { current } = useContext(OverlaysContext);
        const {
          getRelative,
          id,
          index,
          isCurrent,
          isPresent,
          safeToRemove,
          removeSelf,
          withBackdropProps,
        } = useContext(OverlayComponentContext)(null as never);

        return {
          current,
          getRelative,
          id,
          index,
          isCurrent,
          isPresent,
          safeToRemove,
          removeSelf,
          withBackdropProps,
        };
      };

      type Entry = OverlayEntry<Overlays>;

      const getComponentConfig = (
        Component: OverlayComponent
      ): Required<OverlayConfig> => ({
        duplicateBehavior: "allow",
        validateRenderContext: () => true,
        ...defaultConfig,
        ...Component.config,
      });

      const IdentityLayout = Object.assign(
        (props: { children: JSX.Element }) => <>{props.children}</>,
        {
          Backdrop: (props: { children: JSX.Element }) => <>{props.children}</>,
        }
      );

      const getLayout = (Component: OverlayComponent): LayoutComponent =>
        Component?.Layout || DefaultLayout || IdentityLayout;

      function OverlayProvider(
        _props: overlayApi.OverlayProviderProps<Entry, Contexts["push"]>
      ) {
        const { data, onChange, children } = reactiveProps(_props);

        const [stack, setStack] = createBoundSignal.wrap(
          createArray<Entry>([]),
          [data, onChange?.()]
        );
        const entryById = createMemo(() =>
          Object.fromEntries(stack().map((entry) => [entry[1], entry]))
        );

        interface InternalOverlayState {
          isPresent: boolean;
          onRemove(returnValue: any): void;
          layoutProps: ComponentProps<
            Exclude<OverlayComponent["Layout"], undefined>
          >;
          backdropProps: ComponentProps<
            Exclude<
              Exclude<OverlayComponent["Layout"], undefined>["Backdrop"],
              undefined
            >
          >;
        }

        const [stateById, setStateById] = createDeepObject.wrap(
          createObject<Record<Id, InternalOverlayState>>({})
        );

        const current = createMemo(() => {
          const index = stack().findLastIndex(
            ([, id]) => stateById()[id]?.isPresent
          );

          const [key, id] = stack()[index];

          return { index, id, key };
        });

        const remove = (id: number, returnValue: any) => {
          const state = stateById()[id];
          if (!state?.isPresent) return;

          setStateById.deep[id].isPresent(false);
          state.onRemove(returnValue);
        };

        const findById =
          (id: number) =>
          ([, _id]: Entry) =>
            _id === id;

        const renderOverlays = (renderContext?: () => Contexts["render"]) => {
          // Find and dedupe backdrops, only one instance of each needed
          const backdrops = createMemo(
            () => {
              const map = new Map<Component<any>, Record<string, any>>();

              stack().forEach(([key, id], i) => {
                if (!stateById()[id]) return;

                const Component = componentByKey()[key];
                if (!Component || Component === "pending") return;

                const { validateRenderContext } = getComponentConfig(Component);
                if (!validateRenderContext(renderContext)) return;

                const { Backdrop } = getLayout(Component);
                if (!Backdrop) return;

                if (!map.has(Backdrop) || i <= current().index) {
                  map.set(Backdrop, stateById()[id].backdropProps);
                }
              });

              return map;
            },
            null,
            {
              equals(prev, next) {
                if (prev.size !== next.size) return false;
                for (const [Backdrop, props] of prev) {
                  if (next.get(Backdrop) !== props) return false;
                }
                return true;
              },
            }
          );

          return (
            <ErrorBoundary
              fallback={(err, reset) => {
                on(stack, reset);
                setStack([]);
                return <></>;
              }}
            >
              <For each={[...backdrops().keys()]}>
                {(Backdrop) => (
                  <OverlayBackdropContext.Provider
                    value={{
                      show: createMemo(
                        () =>
                          current().id !== -1 &&
                          ((Component = componentByKey()[current().key]) =>
                            Component &&
                            Component !== "pending" &&
                            getLayout(Component).Backdrop === Backdrop)()
                      ),
                      removeCurrent() {
                        const [, overlayId] =
                          stack().findLast(
                            ([, id]) => stateById()[id].isPresent
                          ) || [];
                        if (overlayId == null) return;
                        remove(overlayId, null);
                      },
                    }}
                  >
                    <Backdrop {...backdrops().get(Backdrop)} />
                  </OverlayBackdropContext.Provider>
                )}
              </For>
              <For each={stack().map(([, id]) => id)}>
                {(id, index) => {
                  const [key, , props] = splitAccessor(() => entryById()[id]);

                  // Initial stack entries do not have state, must initialize
                  if (!stateById()[id]) {
                    setStateById.update({
                      [id]: {
                        isPresent: true,
                        onRemove() {},
                        backdropProps: () => null,
                        layoutProps: () => null,
                      },
                    });
                  }

                  return (
                    <>
                      {(() => {
                        const Component:
                          | OverlayComponent
                          | "pending"
                          | undefined = componentByKey()[key()];

                        if (!Component) {
                          (async () => {
                            setComponentByKey.update({
                              [key()]: "pending",
                            } as any);
                            setComponentByKey.update({
                              [key()]: (await overlays[key()]()).default,
                            } as any);
                          })();
                          return null;
                        }
                        if (Component === "pending") return null;

                        // validateRenderContext needs reactive context
                        const { validateRenderContext } =
                          getComponentConfig(Component);

                        if (!validateRenderContext(renderContext?.()))
                          return null;

                        const Layout = getLayout(Component);

                        const state = () => stateById()[id];
                        const isPresent = createMemo(() => state().isPresent);

                        return (
                          <OverlayComponentContext.Provider
                            value={() => ({
                              removeSelf(returnValue = null) {
                                remove(id, returnValue);
                              },
                              updateOwnProps(newProps) {
                                setStack.find(findById(id), [
                                  key(),
                                  id,
                                  { ...props(), ...newProps },
                                ]);
                              },
                              pushSelf(props, context) {
                                return overlaysController.push(
                                  key(),
                                  props,
                                  context
                                );
                              },
                              withLayoutProps(props) {
                                createComputed(() => {
                                  setStateById.deep[id].layoutProps(props());
                                });
                              },
                              withBackdropProps(props) {
                                createComputed(() => {
                                  setStateById.deep[id].backdropProps(props());
                                });
                              },
                              isPresent,
                              safeToRemove() {
                                if (isPresent())
                                  throw new Error(
                                    '"safeToRemove" called while component is still present'
                                  );

                                setStack.splice(index(), 1);
                                setStateById.delete(id);
                              },
                              id,
                              index,
                              isCurrent: () => current().id === id,
                              getRelative: (delta) =>
                                createMemo(() => {
                                  const i =
                                    stack().findIndex(findById(id)) + delta;
                                  const entry = stack()[i];

                                  if (!entry) return null;

                                  const [key, , props] = entry;

                                  return {
                                    key,
                                    id,
                                    props,
                                    // Prevent stack().findIndex from running on unrelated updates
                                    ...createMemo(() => stateById()[id])(),
                                    Component: componentByKey()[
                                      key
                                    ] as OverlayComponent,
                                  };
                                })(),
                            })}
                          >
                            <Layout {...state().layoutProps}>
                              <Component {...props()} />
                            </Layout>
                          </OverlayComponentContext.Provider>
                        );
                      })()}
                    </>
                  );
                }}
              </For>
            </ErrorBoundary>
          );
        };

        const overlaysController: ContextType<typeof OverlaysContext> = {
          push(key, props, context) {
            hooks.push?.(key, props, context);

            const maxId = Math.max(...stack().map(([, id]) => id));
            const id = maxId + 1;

            const entry = [key, id, props] as const;

            let resolveReturnValue: (value: any) => void;
            const returnValue = new Promise((resolve) => {
              resolveReturnValue = resolve;
            });

            setStateById.update({
              [id]: {
                isPresent: true,
                onRemove: resolveReturnValue!,
                backdropProps: () => null,
                layoutProps: () => null,
              },
            });

            return {
              returnValue,
            };
          },
          removeAll() {
            for (const id of Object.keys(stateById)) {
              remove(id as any as Id, null);
            }
          },
          current,
          render: renderOverlays,
          stack,
        };

        return (
          <OverlaysContext.Provider value={overlaysController}>
            {typeof children() === "function"
              ? (children() as any)({ renderOverlays })
              : children()}
          </OverlaysContext.Provider>
        );
      }

      return {
        OverlayProvider,
        useOverlaysController,
        useOverlaysBase,
        useOverlay,
        useOverlayLayout,
        useOverlayBackdrop,
      };
    },
  };
};

export default overlayApi;
