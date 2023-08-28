import { ComponentProps, JSX } from "solid-js";

import { createPropsProvider, reactiveProps, spread } from "solid-u";

import c from "class-c";

import styles from "./Card.module.scss";

declare namespace Card {
  interface Props extends ComponentProps<"div"> {
    class?: string;
    raised?: boolean;
    dugout?: boolean;
    children: JSX.Element;
  }
}

function Card(_props: Card.Props) {
  const {
    children,
    dugout,
    raised,
    class: className,
    ...props
  } = Card.PropsProvider.useMerge(reactiveProps(_props));

  return (
    <div
      {...spread(props)}
      class={c(styles)`
        card
        ${{ dugout, raised }}
      `.c(className?.())}
    >
      {children()}
    </div>
  );
}

Card.PropsProvider = createPropsProvider<Card.Props>("Card");

export default Card;
