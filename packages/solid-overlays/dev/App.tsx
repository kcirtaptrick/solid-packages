import type { Component } from "solid-js";
import logo from "./logo.svg";
import styles from "./App.module.scss";
import { OverlaysProvider, useOverlaysController } from "./overlays";

const App: Component = () => {
  return (
    <OverlaysProvider>
      {({ renderOverlays }) => {
        const overlays = useOverlaysController();

        return (
          <div class={styles.App}>
            <button
              onClick={() => {
                overlays.open("Basic");
              }}
            >
              Basic
            </button>
            <button
              onClick={() => {
                overlays.open("WithOpenSelf");
              }}
            >
              With openSelf
            </button>
            {renderOverlays()}
          </div>
        );
      }}
    </OverlaysProvider>
  );
};

export default App;
