# reactiveProps

Transforms props from reactive getters to reactive accessor functions.

- [reactiveProps](#reactiveprops)
  - [Why?](#why)
  - [Usage](#usage)
    - [Basic](#basic)
    - [Optional props](#optional-props)
    - [Prop defaults](#prop-defaults)
    - [`class` prop](#class-prop)
    - [`children` prop](#children-prop)
    - [Prop spreading](#prop-spreading)
    - [Function props](#function-props)
    - [reactiveProps.withChildren](#reactivepropswithchildren)
    - [reactiveProps.withPropsFor](#reactivepropswithpropsfor)

## Why?

Solid's native props can be restrictive. They disallow destructuring, require helpers to set defaults and apply object transformations, and do not look like idiomatic signal accessors.

Examples:

```tsx
interface Props {
  prop1?: number;
  prop2: string;
  otherProp1: boolean;
  otherProp2(): void;
}

// Not allowed
function Component({ prop1 = 0, prop2, ...rest }: Props) {
  return (
    <div>
      <div>prop1: {prop1}</div>
      <div>prop2: {prop2}</div>
      <OtherComponent {...rest} />
    </div>
  );
}

// Recommended method
import { mergeProps, splitProps } from "solid-js";

function Component(props: Props) {
  // Context duplication
  const merged = mergeProps({ prop1: 0 }, props);

  // This list can get long with many props
  const [local, others] = splitProps(props, ["prop1", "prop2"]);

  return (
    <div>
      <div>prop1: {local.prop1 /* Doesn't like a signal at a glance */}</div>
      <div>prop2: {local.prop2}</div>
      <OtherComponent {...others} />
    </div>
  );
}

// Solution: see Usage section
```

## Usage

Full example, look below snippet for more details

```tsx
import { reactiveProps, spread } from "solid-u";

interface Props {
  prop1?: number;
  prop2: string;
  otherProp1: boolean;
  otherProp2(): void;
}

function Component(props: Props) {
  // Must still pass un-destructured props to maintian reactivity

  const {
    prop1 = () => 0, // Setting defaults
    prop2,
    ...rest
  } = reactiveProps(props);
  /*
    Return type:
    {
      prop1?: () => number;
      prop2: () => string;
      otherProp1: () => boolean;
      otherProp2: () => () => void
    }
   */

  return (
    <div>
      <div>prop1: {prop1() /* Looks like a signal */}</div>
      <div>prop2: {prop2()}</div>
      <OtherComponent {...spread(rest) /* Must use helper to spread props */} />
    </div>
  );
}
```

### Basic

```tsx
import { reactiveProps } from "solid-u";

interface Props {
  prop1: string;
}

function Component(props: Props) {
  // Pass props to reactiveProps
  const { prop1 } = reactiveProps(props);

  return (
    // Use prop by calling it
    <div>{prop1()}</div>
  );
}

// <Component prop1="Some string" /> => <div>Some string</div>
```

### Optional props

You must use the optional chaining operator to access an optional prop, this allows us to assign defaults when destructuring

```tsx
import { reactiveProps } from "solid-u";

interface Props {
  // Note: prop is optional, may be undefined
  prop1?: string;
}

function Component(props: Props) {
  const { prop1 } = reactiveProps(props);

  return (
    // Must use optional chaining operator
    <div>{prop1?.()}</div>
  );
}

// <Component /> => <div></div>
// <Component prop1="Some string" /> => <div>Some string</div>
```

### Prop defaults

```tsx
import { reactiveProps } from "solid-u";

interface Props {
  // Note: prop is optional, may be undefined
  prop1?: string;
}

function Component(props: Props) {
  /**
   * Assign defaults with native js defaults.
   *
   * Instead of directly assigning a value, you must assign an accessor that
   * returns your default value
   */
  const { prop1 = () => "Default string" } = reactiveProps(props);

  return (
    // No longer need optional chaining operator
    <div>{prop1()}</div>
  );
}

// <Component /> => <div>Default string</div>
// <Component prop1="Some string" /> => <div>Some string</div>
```

### `class` prop

Since Solid uses class instead of className, it cannot be assign to a variable on its own. You can either avoid destructuring it or reassign it to className. I recommend against naming the prop className, it can be confusing to diverge from convention.

```tsx
import { reactiveProps } from "solid-u";

interface Props {
  class?: string;
  prop1: string;
}

function Component(_props: Props) {
  // `class` is a reserved word, cannot assign to variable
  // const { prop1, class } = reactiveProps(_props);

  // Option 1:
  const { prop1, ...props } = reactiveProps(_props);

  return <div class={props.class?.()}>...</div>;

  // Option 2:
  const { prop1, class: className } = reactiveProps(_props);

  return <div class={className?.()}>...</div>;
}

// <Component class="class1" ... /> => <div class="class1">...</div>
```

### `children` prop

Normally when handling children, you'd want to use Solid's `children` utility. This is cumbersome with destructuring `children` from props since they have the same name. To make this easier, this package includes `reactiveProps.withChildren` that wraps the `children` prop internally. See the [`reactiveProps.withChildren`](#reactivepropswithchildren) section for more details.

### Prop spreading

Since accessing a prop no longer returns the value directly, we need the `spread` helper to spread props.

```tsx
import { reactiveProps, spread } from "solid-u";

interface Props {
  prop1?: number;
  prop2: string;
  otherProp1: boolean;
  otherProp2(): void;
}

function Component(props: Props) {
  const { prop1 = () => 0, prop2, ...rest } = reactiveProps(props);

  return (
    <div>
      <div>prop1: {prop1()}</div>
      <div>prop2: {prop2()}</div>
      <OtherComponent {...spread(rest)} />
    </div>
  );
}
```

### Function props

Using function props looks a little strange, but works the same way: you must still call the accessor to get the function, then call the function itself.

```tsx
import { reactiveProps, spread } from "solid-u";

interface Props {
  prop1(): void;
  prop2?(arg: string): number;
}

function Component(props: Props) {
  const { prop1, prop2 } = reactiveProps(props);

  return (
    <div>
      <button
        onClick={() => {
          prop1()();
        }}
      >
        call prop1
      </button>
      <button
        onClick={() => {
          const number: number | undefined = prop2?.()("Some string");
        }}
      >
        call prop2
      </button>
    </div>
  );
}
```

### reactiveProps.withChildren

Replacing `reactiveProps(...)` with `reactiveProps.withChildren(...)` will wrap `props.children` with solids `children` utility. `children` prop must be of type `JSX.Element`.

```ts
let props: {
  children?: JSX.Element;
};

const { children } = reactiveProps.withChildren(props);
// children is ReturnType<typeof import("solid-js").children>
```

### reactiveProps.withPropsFor

Replacing `reactiveProps(...)` with `reactiveProps.withPropsFor(...)` will wrap `props.propsFor` with `PropsFor.createHandler`. `propsFor` prop must be of type `PropsFor.Definition`.

```ts
let props: {
  propsFor?: JSX.Element;
};

const { propsFor } = reactiveProps.withPropsFor(props);
// propsFor is PropsFor.Handler<typeof props["propsFor"]>
```
