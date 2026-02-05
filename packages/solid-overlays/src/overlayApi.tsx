import "./polyfill";

import {
  Component,
  ComponentProps,
  createMemo,
  ErrorBoundary,
  For,
  JSX,
  useContext,
  on,
  createComputed,
  untrack,
  Context,
  getOwner,
  Owner,
  runWithOwner,
} from "solid-js";
import OverlayInstanceContext, {
  useOverlayComponent,
} from "./contexts/OverlayInstanceContext";
import {
  BackdropComponent,
  ComponentFromLazy,
  ContextType,
  Id,
  LayoutComponent,
  OverlayComponent,
  OverlayConfig,
  OverlayEntry,
  OverlayResult,
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
import OverlaysContext from "./contexts/OverlaysContext";

export { useOverlayLayout, useOverlayBackdrop, useOverlayComponent };
export type {
  OverlayComponent,
  OverlayConfig,
  LayoutComponent,
  BackdropComponent,
};

type RequiredParameter<T> = T extends () => unknown ? never : T;

declare namespace overlayApi {
  interface Options<DefaultLayoutType extends LayoutComponent> {
    DefaultLayout?: DefaultLayoutType;
  }
  namespace OverlaysProvider {
    type RenderFunction = (context: {
      renderOverlays(): JSX.Element;
    }) => JSX.Element;
    type Props<Entry, OpenContext, TRenderFunction extends RenderFunction> = {
      data?: Entry[];
      onChange?(
        data?: Props<Entry, OpenContext, TRenderFunction>["data"],
        openContext?: OpenContext,
      ): void;
      children: JSX.Element | RequiredParameter<TRenderFunction>;
    };
  }
  namespace create {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export interface Options<
      Overlays extends OverlaysSchema,
      Context extends { open?: any; render?: any },
    > {
      hooks?: {
        open?<Key extends keyof Overlays>(
          key: Key,
          props: PropsFromLazy<Overlays[Key]>,
          context?: Context["open"],
        ): void;
        close?<Key extends keyof Overlays>(
          key: Key,
          result: OverlayResult<ComponentFromLazy<Overlays[Key]>>,
        ): void;
      };
      defaultConfig?: OverlayConfig<Context["render"]>;
    }
  }
}

let currentId = -1;

const contextSymbol = Symbol("overlayApi.context");
const instanceContextSymbol = Symbol("overlayApi.instanceContext");

function overlayApi<
  Overlays extends OverlaysSchema,
  DefaultLayoutType extends LayoutComponent = LayoutComponent,
>(
  overlays: Overlays,
  { DefaultLayout }: overlayApi.Options<DefaultLayoutType> = {},
) {
  const [componentByKey, setComponentByKey] = createObject<
    Partial<Record<keyof Overlays, OverlayComponent | "pending">>
  >({});

  const OverlaysContextRef = OverlaysContext;
  const InstanceContextRef = OverlayInstanceContext;

  return {
    create<
      Contexts extends { open?: any; render?: any } = {
        open?: unknown;
        render?: unknown;
      },
    >({
      hooks = {},
      defaultConfig = {},
    }: overlayApi.create.Options<Overlays, Contexts>) {
      const OverlaysContext = OverlaysContextRef as Context<
        OverlaysContext<Overlays, Contexts>
      >;
      const OverlayInstanceContext = InstanceContextRef as Context<
        OverlayInstanceContext<Overlays, DefaultLayoutType, Contexts["open"]>
      >;
      const useOverlaysController = () => {
        const context = useContext(OverlaysContext);
        if (!context)
          throw new Error(
            "Attempted to call useOverlaysController outside of OverlaysContext.",
          );

        const { open, closeAll } = context(getOwner()!);
        return { open, closeAll };
      };

      const useOverlaysBase = () => {
        const context = useContext(OverlaysContext);
        if (!context)
          throw new Error(
            "Attempted to call useOverlaysBase outside of OverlaysContext.",
          );

        const { render, stack, closeCurrent } = context(getOwner()!);
        return { render, stack, closeCurrent };
      };

      const useOverlay = <ComponentType extends OverlayComponent>(
        Component: ComponentType,
      ) => {
        const context = useContext(OverlayInstanceContext);
        if (!context)
          throw new Error(
            "Attempted to call useOverlay outside of OverlayInstanceContext.",
          );

        const { close, updateOwnProps, openSelf, withLayoutProps, onClose } =
          context(getOwner()!, Component);

        const { withBackdropProps } = useContext(OverlayLayoutContext)(
          (Component.Layout || DefaultLayout!) as Exclude<
            ComponentType["Layout"],
            undefined
          > extends infer T
            ? T extends never
              ? DefaultLayoutType
              : unknown extends T
              ? DefaultLayoutType
              : Extract<T, LayoutComponent>
            : never,
        );

        return {
          onClose,
          close,
          updateOwnProps,
          openSelf,
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

      function OverlaysProvider<
        RenderFunction extends overlayApi.OverlaysProvider.RenderFunction,
      >(
        _props: overlayApi.OverlaysProvider.Props<
          Entry,
          Contexts["open"],
          RenderFunction
        >,
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
          owner: Owner;
          isPresent: boolean;
          onClose(result: any): void;
          closeListeners: ((result: any) => void)[];
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
                  owner: undefined!,
                  isPresent: true,
                  closeListeners: [],
                  onClose() {},
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

        const remove = (id: number, result?: any) => {
          const state = stateById()[id];
          if (!state?.isPresent) return;

          setStateById.deep[id]!.isPresent(false);
          state.onClose(
            result ??
              (
                componentByKey()[
                  stack().find(findById(id))![0]
                ] as OverlayComponent
              ).defaultResult,
          );
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
                console.error(err);
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
                      closeCurrent() {
                        const [, overlayId] =
                          stack().findLast(
                            ([, id]) => stateById()[id]!.isPresent,
                          ) || [];
                        if (overlayId == null) return;
                        remove(overlayId);
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
                  const key = untrack(() => entryById()[id]![0]);
                  const props = createMemo(() => entryById()[id]![2]);

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

                        const owner = createMemo(() => state().owner);

                        if (!owner()) return null;

                        return runWithOwner(owner(), () => (
                          <OverlayInstanceContext.Provider
                            value={Object.assign(
                              ((owner) => ({
                                index,
                                onClose(handler) {
                                  setStateById.deep[id]!.closeListeners([
                                    ...(stateById()[id]?.closeListeners || []),
                                    handler,
                                  ]);
                                },
                                close(result) {
                                  remove(id, result);
                                },
                                updateOwnProps(newProps) {
                                  if (!stack().some(findById(id))) {
                                    console.warn(
                                      `Attempted to call updateOwnProps on removed overlay ${String(
                                        key,
                                      )}: ${JSON.stringify(newProps)}`,
                                    );
                                    return;
                                  }
                                  setStack.find(findById(id), [
                                    key,
                                    id,
                                    { ...props(), ...newProps },
                                  ]);
                                },
                                openSelf: Object.assign(
                                  (newProps: any, context: Contexts["open"]) =>
                                    overlaysController(owner).open(
                                      key,
                                      { ...props(), ...newProps },
                                      context,
                                    ),
                                  {
                                    keyOnly: (
                                      props: any,
                                      context: Contexts["open"],
                                    ) =>
                                      overlaysController(owner).open(
                                        key,
                                        props,
                                        context,
                                      ),
                                  },
                                ) as any,
                                withLayoutProps(props) {
                                  createComputed(() => {
                                    setStateById.deep[id]?.layoutProps(props());
                                  });
                                },
                              })) satisfies (typeof OverlayInstanceContext)["defaultValue"],
                              { [instanceContextSymbol]: true },
                            )}
                          >
                            <OverlayLayoutContext.Provider
                              value={() => ({
                                close() {
                                  remove(id);
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
                              <Layout {...state()?.layoutProps}>
                                <Component {...props()} />
                              </Layout>
                            </OverlayLayoutContext.Provider>
                          </OverlayInstanceContext.Provider>
                        ));
                      })()}
                    </>
                  );
                }}
              </For>
            </ErrorBoundary>
          );
        };

        const overlaysController: Exclude<
          ContextType<typeof OverlaysContext>,
          undefined
        > = (owner: Owner) => ({
          open(key, props: any = {}, context) {
            hooks.open?.(key, props, context);

            const componentLoad = signalValuePromise(
              () => componentByKey()[key],
              (component) => component && component !== "pending",
            );

            let resolveResult: (value: any) => void = null!;
            const result = new Promise((resolve) => {
              resolveResult = resolve;
            });

            const maxId = Math.max(currentId, ...stack().map(([, id]) => id));
            const id = maxId + 1;
            currentId = id;

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

              setStack.push([key, id, props]);
              setStateById.deep[id]!.owner(owner);
              setStateById.deep[id]!.onClose(() => (result) => {
                for (const listener of stateById()[id]!.closeListeners) {
                  listener(result);
                }
                resolveResult(result);
              });
            })();

            return {
              result,
              componentLoad: componentLoad.then(() => {}),
              close(result) {
                remove(id, result);
              },
            };
          },
          closeAll() {
            for (const id of Object.keys(stateById())) {
              remove(+id);
            }
          },
          closeCurrent() {
            remove(current().id);
          },
          current,
          render: renderOverlays,
          stack,
        });

        // @ts-expect-error
        overlaysController[contextSymbol] = true;

        return (
          <OverlaysContext.Provider value={overlaysController}>
            {(() => {
              const childrenOrFn = children();

              return typeof childrenOrFn === "function" &&
                childrenOrFn.length > 0
                ? (childrenOrFn as any)({ renderOverlays })
                : childrenOrFn;
            })()}
          </OverlaysContext.Provider>
        );
      }

      return {
        OverlaysContext,
        OverlaysProvider,
        useOverlaysController,
        useOverlaysBase,
        useOverlay,
        useOverlayLayout,
        useOverlayBackdrop,
      };
    },
  };
}

export default overlayApi;

export const useAnyOverlaysController = <
  Overlays extends OverlaysSchema,
  Contexts extends { open?: any } = {},
>() => {
  const owner = getOwner();
  if (!owner)
    throw new Error(
      "Attempted to call useAnyOverlaysController outside of a OverlaysProvider",
    );

  const context: OverlaysContext<Overlays, Contexts> | undefined =
    Reflect.ownKeys(owner.context)
      .map((key) => owner.context[key])
      .reverse()
      .find((context) => context[contextSymbol]);

  if (!context)
    throw new Error(
      "Attempted to call useAnyOverlaysController outside of a OverlaysProvider",
    );

  const { open, closeAll } = context(owner);
  return { open, closeAll };
};

export const useAnyOverlay = <
  ComponentType extends OverlayComponent,
  Overlays extends OverlaysSchema,
  Contexts extends { open?: any } = {},
>(
  Component: ComponentType,
) => {
  const owner = getOwner();
  if (!owner)
    throw new Error(
      "Attempted to call useAnyOverlay outside of a OverlaysProvider",
    );

  const instanceContext:
    | OverlayInstanceContext<Overlays, LayoutComponent, Contexts["open"]>
    | undefined = Reflect.ownKeys(owner.context)
    .map((key) => owner.context[key])
    .reverse()
    .find((context) => context[instanceContextSymbol]);

  if (!instanceContext)
    throw new Error(
      "Attempted to call useAnyOverlay outside of a OverlayInstanceContext",
    );

  const { close, updateOwnProps, openSelf, withLayoutProps, onClose } =
    instanceContext(getOwner()!, Component);

  const { withBackdropProps } = useContext(OverlayLayoutContext)(
    Component.Layout as Extract<
      Exclude<ComponentType["Layout"], undefined>,
      LayoutComponent
    >,
  );

  const res = {
    onClose,
    close,
    updateOwnProps,
    openSelf,
    withLayoutProps,
    withBackdropProps,
  };

  return res as unknown extends ComponentType["Layout"]
    ? Omit<typeof res, "withLayoutProps" | "withBackdropProps">
    : typeof res;
};
