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
  untrack,
} from "solid-js";
import createOverlayComponentContext from "./contexts/createOverlayComponentContext";
import createOverlaysContext from "./contexts/createOverlaysContext";
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
import OverlayLayoutContext, {
  useOverlayLayout,
} from "./contexts/OverlayLayoutContext";
import OverlayBackdropContext, {
  useOverlayBackdrop,
} from "./contexts/OverlayBackdropContext";
import { reactiveProps, signalValuePromise } from "solid-u";
import { Tuple } from "record-tuple";

declare namespace overlayApi {
  export interface Options<DefaultLayoutType extends LayoutComponent> {
    DefaultLayout?: DefaultLayoutType;
  }
  interface OverlaysProviderProps<Entry, PushContext> {
    data?: Entry[];
    onChange?(
      data?: OverlaysProviderProps<Entry, PushContext>["data"],
      pushContext?: PushContext,
    ): void;
    children:
      | JSX.Element
      | ((context: { renderOverlays(): JSX.Element }) => JSX.Element);
  }
  export namespace create {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options<
      Overlays extends OverlaysSchema,
      Context extends { push?: any; render?: any },
    > {
      hooks?: {
        push?<Key extends keyof Overlays>(
          key: Key,
          props: PropsFromLazy<Overlays[Key]>,
          context?: Context["push"],
        ): void;
      };
      defaultConfig?: OverlayConfig<Context["render"]>;
    }
  }
}

const overlayApi = <
  Overlays extends OverlaysSchema,
  DefaultLayoutType extends LayoutComponent = LayoutComponent,
>(
  overlays: Overlays,
  { DefaultLayout }: overlayApi.Options<DefaultLayoutType> = {},
) => {
  const [componentByKey, setComponentByKey] = createObject<
    Partial<Record<keyof Overlays, OverlayComponent | "pending">>
  >({});

  return {
    create<
      Contexts extends { push?: any; render?: any } = {
        push?: unknown;
        render?: unknown;
      },
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

      const useOverlaysController = () => {
        const { push, removeAll } = useContext(OverlaysContext);
        return { push, removeAll };
      };

      const useOverlaysBase = () => {
        const { render, stack } = useContext(OverlaysContext);
        return { render, stack };
      };

      const useOverlay = <ComponentType extends OverlayComponent>(
        Component: ComponentType,
      ) => {
        const { removeSelf, updateOwnProps, pushSelf, withLayoutProps } =
          useContext(OverlayComponentContext)(Component);

        const { withBackdropProps } = useContext(OverlayLayoutContext)(
          Component.Layout || DefaultLayout!,
        );

        return {
          removeSelf,
          updateOwnProps,
          pushSelf,
          withLayoutProps,
          withBackdropProps,
        };
      };

      type Entry = OverlayEntry<Overlays>;

      const getComponentConfig = (
        Component: OverlayComponent,
      ): Required<OverlayConfig> => ({
        duplicateBehavior: "allow",
        limit: "none",
        validateRenderContext: () => true,
        ...defaultConfig,
        ...Component.config,
      });

      const IdentityLayout = Object.assign(
        (props: { children: JSX.Element }) => <>{props.children}</>,
        {
          Backdrop: (props: { children: JSX.Element }) => <>{props.children}</>,
        },
      );

      const getLayout = (Component: OverlayComponent): LayoutComponent =>
        Component?.Layout || DefaultLayout || IdentityLayout;

      function OverlaysProvider(
        _props: overlayApi.OverlaysProviderProps<Entry, Contexts["push"]>,
      ) {
        const { data, onChange, children } = reactiveProps(_props);

        const [stack, setStack] = createBoundSignal.wrap(
          createArray<Entry>([]),
          [data, onChange?.()],
        );
        const entryById = createMemo(() =>
          Object.fromEntries(stack().map((entry) => [entry[1], entry])),
        );

        interface InternalOverlayState {
          isPresent: boolean;
          onRemove(result: any): void;
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
          createObject<Record<Id, InternalOverlayState>>({}),
        );

        const reconcileStates = createMemo(() => {
          if (
            Tuple(...Object.keys(untrack(stateById))) ===
            Tuple(...stack().map(([, id]) => `${id}`))
          )
            return;

          setStateById((prev) =>
            Object.fromEntries(
              stack().map(([, id]) => [
                id,
                prev[id] || {
                  isPresent: true,
                  onRemove() {},
                  backdropProps: () => null,
                  layoutProps: () => null,
                },
              ]),
            ),
          );
        });

        const current = createMemo(() => {
          const index = stack().findLastIndex(
            ([, id]) => stateById()[id]?.isPresent,
          );

          if (index === -1) return { index: -1, id: -1, key: "" };

          const [key, id] = stack()[index]!;

          return { index, id, key };
        });

        const remove = (id: number, result: any) => {
          const state = stateById()[id];
          if (!state?.isPresent) return;

          setStateById.deep[id]!.isPresent(false);
          state.onRemove(result);
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
                const state = stateById()[id];
                if (!state) return;

                const Component = createMemo(() => componentByKey()[key])();
                if (!Component || Component === "pending") return;

                const { validateRenderContext } = getComponentConfig(Component);
                if (!validateRenderContext(renderContext)) return;

                const { Backdrop } = getLayout(Component);
                if (!Backdrop) return;

                if (!map.has(Backdrop) || i <= current().index) {
                  map.set(Backdrop, state.backdropProps);
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
            },
          );

          return (
            <ErrorBoundary
              fallback={(err, reset) => {
                console.log({ err });
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
                          ((
                            Component = createMemo(
                              () => componentByKey()[current().key],
                            )(),
                          ) =>
                            Component &&
                            (Component === "pending" ||
                              getLayout(Component).Backdrop === Backdrop))(),
                      ),
                      removeCurrent() {
                        const [, overlayId] =
                          stack().findLast(
                            ([, id]) => stateById()[id]!.isPresent,
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
              <For
                each={
                  // The body of this For depends on stateById,
                  // `reconcileStates()` ensures its memo body executes before
                  // this
                  (reconcileStates(), stack().map(([, id]) => id))
                }
              >
                {(id, index) => {
                  const key = entryById()[id]![0];
                  const props = () => entryById()[id]![2];

                  // Wrap in reactive context to allow guards
                  return (
                    <>
                      {(() => {
                        const Component:
                          | OverlayComponent
                          | "pending"
                          | undefined = createMemo(
                          () => componentByKey()[key],
                        )();

                        if (!Component) {
                          (async () => {
                            setComponentByKey.update({
                              [key]: "pending",
                            } as any);
                            setComponentByKey.update({
                              [key]: (await overlays[key]!()).default,
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

                        const state = () => stateById()[id]!;
                        const isPresent = createMemo(() => state().isPresent);

                        return (
                          <OverlayComponentContext.Provider
                            value={() => ({
                              removeSelf(result = null) {
                                remove(id, result);
                              },
                              updateOwnProps(newProps) {
                                setStack.find(findById(id), [
                                  key,
                                  id,
                                  { ...props(), ...newProps },
                                ]);
                              },
                              pushSelf: Object.assign(
                                (newProps: any, context: Contexts["push"]) =>
                                  overlaysController.push(
                                    key,
                                    { ...props(), ...newProps },
                                    context,
                                  ),
                                {
                                  keyOnly: (
                                    props: any,
                                    context: Contexts["push"],
                                  ) =>
                                    overlaysController.push(
                                      key,
                                      props,
                                      context,
                                    ),
                                },
                              ) as any,
                              withLayoutProps(props) {
                                createComputed(() => {
                                  setStateById.deep[id]!.layoutProps(props());
                                });
                              },
                            })}
                          >
                            <OverlayLayoutContext.Provider
                              value={() => ({
                                removeSelf() {
                                  remove(id, null);
                                },
                                withBackdropProps(props) {
                                  createComputed(() => {
                                    setStateById.deep[id]!.backdropProps(
                                      props(),
                                    );
                                  });
                                },
                                isPresent,
                                safeToRemove() {
                                  if (isPresent())
                                    throw new Error(
                                      '"safeToRemove" called while component is still present',
                                    );

                                  if (!(id in entryById()))
                                    throw new Error(
                                      `Already called "safeToRemove" in ${
                                        key as any
                                      }`,
                                    );

                                  setStack(
                                    stack().filter(
                                      ([, entryId]) => entryId !== id,
                                    ),
                                  );
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
                                      ...createMemo(() => stateById()[id]!)(),
                                      Component: componentByKey()[
                                        key
                                      ] as OverlayComponent,
                                    };
                                  })(),
                                root: { current },
                              })}
                            >
                              <Layout {...state().layoutProps}>
                                <Component {...props()} />
                              </Layout>
                            </OverlayLayoutContext.Provider>
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
          push(key, props: any = {}, context) {
            hooks.push?.(key, props, context);

            const componentLoad = signalValuePromise(
              () => componentByKey()[key],
              (component) => component && component !== "pending",
            );

            let resolveResult: (value: any) => void = null!;
            const result = new Promise((resolve) => {
              resolveResult = resolve;
            });

            (async () => {
              const Component = componentByKey()[key];
              if (Component) {
                const { limit } = getComponentConfig(
                  (Component === "pending"
                    ? await componentLoad
                    : Component) as Exclude<typeof Component, "pending">,
                );
                if (limit === "once-per-session") return resolveResult(null);
              }

              const maxId = Math.max(0, ...stack().map(([, id]) => id));
              const id = maxId + 1;

              setStack.push([key, id, props]);
              setStateById.deep[id]!.onRemove(() => resolveResult);
            })();

            return {
              result,
              componentLoad: componentLoad.then(() => {}),
            };
          },
          removeAll() {
            for (const id of Object.keys(stateById())) {
              remove(id as any as Id, null);
            }
          },
          current,
          render: renderOverlays,
          stack,
        };

        return (
          <OverlaysContext.Provider value={overlaysController}>
            {(() => {
              const childrenOrRender = children();

              return typeof childrenOrRender === "function"
                ? (childrenOrRender as any)({ renderOverlays })
                : childrenOrRender;
            })()}
          </OverlaysContext.Provider>
        );
      }

      return {
        OverlaysProvider,
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
