import { Accessor, children, Component, JSX } from "solid-js";
import { FormContext } from "./FormContext";

declare namespace createForm {
  export type Resolver<
    Fields extends Record<string, any>,
    Options = undefined
  > = (
    data: any,
    options: Options
  ) => {
    values: Fields | null;
    errors: Record<keyof Fields, Error> | null;
  };
  export interface Options<
    Fields extends Record<string, any> = Record<string, any>,
    ResolverOptions = undefined
  > {
    resolver: Resolver<Fields, ResolverOptions>;
    fieldDefaults?: Fields;
  }
  export type Register<Fields extends Record<string, any>> = <
    Field extends keyof Fields
  >(
    name: Field,
    options: Register.Options
  ) => { name: keyof Fields };
  export namespace Register {
    export interface Options {}
    export interface OptionalProps {
      error?: Error;
      valid: boolean;
    }
  }
  export type Result<Fields extends Record<string, any> = Record<string, any>> =
    {
      Provider: Component<{ children: Accessor<JSX.Element> }>;
      register: Register<Fields>;
      handleSubmit(e: Event): void;
    };
}

function createForm<Fields extends Record<string, any>, ResolverOptions>({
  resolver,
}: createForm.Options<Fields, ResolverOptions>) {
  const res: createForm.Result<Fields> = {
    Provider: (props) => (
      <FormContext.Provider
        value={res as createForm.Result}
        children={props.children()}
      />
    ),
    register(name, options) {
      return { name };
    },
    handleSubmit(e) {},
  };

  return res;
}

export default createForm;

createForm({
  resolver: (data, options: {}) => ({
    values: { test: "test" },
    errors: { test: new Error() },
  }),
});
