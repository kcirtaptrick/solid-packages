import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import createHistory from "../createHistory";
import createGrid from "./createGrid";

const test = suite("createGrid");

test("Creates grid signal", () => {
  createRoot((dispose) => {
    const [grid, setGrid] = createGrid([
      [1, 2],
      [3, 4],
    ]);

    assert.equal(grid(), [
      [1, 2],
      [3, 4],
    ]);

    dispose();
  });
});

test.run();
