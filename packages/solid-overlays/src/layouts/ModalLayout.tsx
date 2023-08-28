import { createEffect, createMemo, createSignal, JSX, onMount } from "solid-js";
import { reactiveProps } from "solid-u";

import styles from "./ModalLayout.module.scss";
import DarkenBackdrop from "../backdrops/DarkenBackdrop";
import { useOverlayLayout } from "../contexts/OverlayLayoutContext";

declare namespace ModalLayout {
  interface Props {
    onClose?(): void;
    children: JSX.Element;
  }
}

function ModalLayout(_props: ModalLayout.Props) {
  const { children } = reactiveProps(_props);

  const [initial, setInitial] = createSignal(true);
  onMount(() => {
    requestAnimationFrame(() => {
      setInitial(false);
    });
  });

  const layout = useOverlayLayout(ModalLayout);

  const prev = () => layout.getRelative(-1);

  const left = () => layout.index() < layout.root.current().index;
  const right = () => layout.index() > layout.root.current().index;
  const enterRight = () =>
    layout.isCurrent() && prev() && initial() && layout.isPresent();
  const cleared = () => layout.root.current().index === -1;

  createEffect(() => {
    if (!layout.isPresent())
      setTimeout(() => {
        layout.safeToRemove();
      }, 400);
  });

  return (
    <div
      class={[
        styles.modal,
        left() && styles.left,
        (right() || enterRight()) && !cleared() && styles.right,
        layout.isCurrent() && styles.show,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div>
        <div>{children()}</div>
      </div>
    </div>
  );
}

ModalLayout.Backdrop = DarkenBackdrop;

export default ModalLayout;
