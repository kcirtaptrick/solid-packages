import { reactiveProps } from "solid-u";

import { useOverlayBackdrop } from "../contexts/OverlayBackdropContext";

import "./DarkenBackdrop.scss";

declare namespace DarkenBackdrop {
  interface Props {
    noClose?: boolean;
  }
}

function DarkenBackdrop(_props: DarkenBackdrop.Props) {
  const { noClose } = reactiveProps(_props);

  const { show, closeCurrent } = useOverlayBackdrop();

  return (
    <div
      class={["solid-overlays:darken-backdrop", show() && "show"]
        .filter(Boolean)
        .join(" ")}
      onClick={() => {
        if (noClose?.() || !show()) return;
        closeCurrent();
      }}
    />
  );
}

export default DarkenBackdrop;
