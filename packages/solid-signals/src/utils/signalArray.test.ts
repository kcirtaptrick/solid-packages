import { createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createArray, createHistory } from "../signals";
import signalArray from "./signalArray";

const test1 = suite("signalMap: single-level");
const testn = suite("signalMap: multi-level");

test1("Basic", () => {
  createRoot((dispose) => {
    const [array, setArray] = signalArray(
      Array.from({ length: 5 }, (_, i) => createSignal(i))
    );

    assert.equal(
      array.map((item) => item()),
      [0, 1, 2, 3, 4]
    );

    for (const setItem of setArray) {
      setItem((item) => item * 2);
    }

    assert.equal(
      array.map((item) => item()),
      [0, 2, 4, 6, 8]
    );

    dispose();
  });
});

testn("Basic", () => {
  createRoot((dispose) => {
    const [array, setArray] = signalArray(
      Array.from({ length: 3 }, (_, i) =>
        Array.from({ length: 3 }, (_, j) => createSignal(i * 3 + j))
      )
    );

    assert.equal(
      array.map((inner) => inner.map((item) => item())),
      [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
      ]
    );

    for (const setItem of setArray.flat()) {
      setItem((item) => item * 2);
    }

    assert.equal(
      array.map((inner) => inner.map((item) => item())),
      [
        [0, 2, 4],
        [6, 8, 10],
        [12, 14, 16],
      ]
    );

    dispose();
  });
});

test1("Extended signals", () => {
  createRoot((dispose) => {
    const [array, setArray] = signalArray(
      Array.from({ length: 5 }, (_, i) => createArray([i]))
    );

    assert.equal(
      array.map((item) => item()),
      [[0], [1], [2], [3], [4]]
    );

    for (const setItem of setArray) {
      setItem.push(0);
    }

    assert.equal(
      array.map((item) => item()),
      // prettier-ignore
      [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]
    );

    dispose();
  });
});

testn("Extended signals", () => {
  createRoot((dispose) => {
    const [array, setArray] = signalArray(
      Array.from({ length: 3 }, (_, i) =>
        Array.from({ length: 3 }, (_, j) => createArray([i * 3 + j]))
      )
    );

    assert.equal(
      array.map((inner) => inner.map((item) => item())),
      [
        [[0], [1], [2]],
        [[3], [4], [5]],
        [[6], [7], [8]],
      ]
    );

    for (const setItem of setArray.flat()) {
      setItem.push(0);
    }

    assert.equal(
      array.map((inner) => inner.map((item) => item())),
      // prettier-ignore
      [
        [[0, 0], [1, 0], [2, 0]],
        [[3, 0], [4, 0], [5, 0]],
        [[6, 0], [7, 0], [8, 0]],
      ]
    );

    dispose();
  });
});

test1("Works with composed signals", () => {
  createRoot((dispose) => {
    const [array, setArray] = signalArray(
      Array.from({ length: 5 }, (_, i) => createHistory.wrap(createArray([i])))
    );

    assert.equal(
      array.map((item) => item()),
      [[0], [1], [2], [3], [4]]
    );
    assert.equal(
      array.map((item) => item.history()),
      [[[0]], [[1]], [[2]], [[3]], [[4]]]
    );

    for (const setItem of setArray) {
      setItem.push(0);
    }

    assert.equal(
      array.map((item) => item()),
      // prettier-ignore
      [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]
    );
    assert.equal(
      array.map((item) => item.history()),
      // prettier-ignore
      [[[0], [0, 0]], [[1], [1, 0]], [[2], [2, 0]], [[3], [3, 0]], [[4], [4, 0]]]
    );

    for (const setItem of setArray) {
      assert.is(setItem.history.back(), true);
    }

    assert.equal(
      array.map((item) => item()),
      [[0], [1], [2], [3], [4]]
    );
    assert.equal(
      array.map((item) => item.history()),
      [[[0]], [[1]], [[2]], [[3]], [[4]]]
    );
    assert.equal(
      array.map((item) => item.history.forward()),
      // prettier-ignore
      [[[0, 0]], [[1, 0]], [[2, 0]], [[3, 0]], [[4, 0]]]
    );

    for (const setItem of setArray) {
      assert.is(setItem.history.back(), false);
    }

    dispose();
  });
});

testn("Works with composed signals", () => {
  createRoot((dispose) => {
    const [array, setArray] = signalArray(
      Array.from({ length: 3 }, (_, i) =>
        Array.from({ length: 3 }, (_, j) =>
          createHistory.wrap(createArray([i * 3 + j]))
        )
      )
    );

    assert.equal(
      array.map((inner) => inner.map((item) => item())),
      [
        [[0], [1], [2]],
        [[3], [4], [5]],
        [[6], [7], [8]],
      ]
    );
    assert.equal(
      array.map((inner) => inner.map((item) => item.history())),
      [
        [[[0]], [[1]], [[2]]],
        [[[3]], [[4]], [[5]]],
        [[[6]], [[7]], [[8]]],
      ]
    );

    for (const setItem of setArray.flat()) {
      setItem.push(0);
    }

    assert.equal(
      array.map((inner) => inner.map((item) => item())),
      // prettier-ignore
      [
        [[0, 0], [1, 0], [2, 0]],
        [[3, 0], [4, 0], [5, 0]],
        [[6, 0], [7, 0], [8, 0]],
      ]
    );

    assert.equal(
      array.map((inner) => inner.map((item) => item.history())),
      // prettier-ignore
      [
        [[[0], [0, 0]], [[1], [1, 0]], [[2], [2, 0]]],
        [[[3], [3, 0]], [[4], [4, 0]], [[5], [5, 0]]],
        [[[6], [6, 0]], [[7], [7, 0]], [[8], [8, 0]]],
      ]
    );

    for (const setItem of setArray.flat()) {
      assert.is(setItem.history.back(), true);
    }

    assert.equal(
      array.map((inner) => inner.map((item) => item())),
      [
        [[0], [1], [2]],
        [[3], [4], [5]],
        [[6], [7], [8]],
      ]
    );
    assert.equal(
      array.map((inner) => inner.map((item) => item.history())),
      [
        [[[0]], [[1]], [[2]]],
        [[[3]], [[4]], [[5]]],
        [[[6]], [[7]], [[8]]],
      ]
    );
    assert.equal(
      array.map((inner) => inner.map((item) => item.history.forward())),
      // prettier-ignore
      [
        [[[0, 0]], [[1, 0]], [[2, 0]]],
        [[[3, 0]], [[4, 0]], [[5, 0]]],
        [[[6, 0]], [[7, 0]], [[8, 0]]],
      ]
    );

    for (const setItem of setArray.flat()) {
      assert.is(setItem.history.back(), false);
    }

    dispose();
  });
});

test1.run();
testn.run();
