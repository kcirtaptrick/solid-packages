import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import createHistory from "../createHistory";
import createObjectGrid from "./createObjectGrid";

const test = suite("createObjectGrid");

test("Creates object grid signal", () => {
  createRoot((dispose) => {
    const [objectGrid, setObjectGrid] = createObjectGrid([
      [1, 2],
      [3, 4],
    ]);

    assert.equal(objectGrid(), [
      [1, 2],
      [3, 4],
    ]);

    dispose();
  });
});

test.run();
