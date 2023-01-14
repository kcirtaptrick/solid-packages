# handleEvent

> Properly handle event in accordance with type `JSX.EventHandlerUnion` this normally requires either repeated inconvenient logic or a type cast.

## Usage

```tsx

interface Props extends ComponentProps<"input"> {
  ...
}

<button
  onClick={(e) => {
  // This expression is not callable.
  //   Not all constituents of type 'EventHandlerUnion<HTMLButtonElement, MouseEvent>' are callable.
  //     Type 'BoundEventHandler<HTMLButtonElement, MouseEvent>' has no call signatures.
    props.onClick?.(e);

    // Previous solutions
    const { onClick } = props;
    if(onClick) {
      if ("0" in onClick) onClick[0](onClick[1], e);
      else onClick(e);
    }

    // or
    (props.onClick as JSX.EventHandler<HTMLButtonElement, MouseEvent>)?.(e)

    // Using this helper, easy typing + type compliant
    handleChange(props.onClick, e);
  }}
>
  ...
</button>

TODO: More docs
```
