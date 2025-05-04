import overlayApi, { ModalLayout } from "../../src";

declare module "node_modules/vite/types/importGlob" {
  export interface ImportGlobFunction {
    <Glob extends "./**/*.tsx">(
      glob: Glob,
      options?: ImportGlobOptions<false, string>,
    ): {
      "./Basic.tsx": () => Promise<typeof import("./Basic")>;
      "./WithOpenSelf.tsx": () => Promise<typeof import("./WithOpenSelf")>;
    };
  }
}

const trimKeys = <
  Obj extends Record<string, any>,
  Prefix extends string,
  Suffix extends string = "",
>(
  obj: Obj,
  prefix: Prefix,
  suffix = "" as Suffix,
): {
  [Key in keyof Obj as Key extends `${Prefix}${infer T}${Suffix}`
    ? T
    : never]: Obj[Key];
} =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      if (!k.startsWith(prefix))
        throw new Error(
          `Found key "${k}" that does not start with prefix "${prefix}"`,
        );
      if (!k.endsWith(suffix))
        throw new Error(
          `Found key "${k}" that does not start with suffix "${suffix}"`,
        );

      return [k.slice(prefix.length).slice(0, -suffix.length || Infinity), v];
    }),
  ) as any;

export const {
  OverlaysProvider,
  useOverlay,
  useOverlayLayout,
  useOverlaysController,
  useOverlaysBase,
  useOverlayBackdrop,
} = overlayApi(trimKeys(import.meta.glob("./**/*.tsx"), "./", ".tsx"), {
  DefaultLayout: ModalLayout,
}).create({});
