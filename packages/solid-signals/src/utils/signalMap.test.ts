import { createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import signalMap from "./signalMap";
import { createArray, createHistory, createObject } from "../signals";
import signalArray from "./signalArray";

const test = suite("signalMap");

test("Single mapped signal", () => {
  createRoot((dispose) => {
    const [map, setMap] = signalMap({
      a: createSignal(0),
    });

    assert.is(map.a(), 0);

    setMap.a(1);

    assert.is(map.a(), 1);

    dispose();
  });
});

test("Multiple mapped signal", () => {
  createRoot((dispose) => {
    const [map, setMap] = signalMap({
      a: createSignal(0),
      b: createSignal(1),
    });

    assert.is(map.a(), 0);
    assert.is(map.b(), 1);

    setMap.a(2);
    setMap.b(3);

    assert.is(map.a(), 2);
    assert.is(map.b(), 3);

    dispose();
  });
});

test("Nested mapped signals", () => {
  createRoot((dispose) => {
    const [map, setMap] = signalMap({
      a: createSignal(0),
      b: createSignal(1),
      c: {
        d: createSignal(2),
        e: createSignal(3),
      },
    });

    assert.is(map.a(), 0);
    assert.is(map.b(), 1);
    assert.is(map.c.d(), 2);
    assert.is(map.c.e(), 3);

    setMap.a(4);
    setMap.b(5);
    setMap.c.d(6);
    setMap.c.e(7);

    assert.is(map.a(), 4);
    assert.is(map.b(), 5);
    assert.is(map.c.d(), 6);
    assert.is(map.c.e(), 7);

    dispose();
  });
});

test("Works with extended signals", () => {
  createRoot((dispose) => {
    const [map, setMap] = signalMap({
      a: createObject({ p1: 0 }),
      b: {
        c: createArray([0]),
      },
    });

    assert.equal(map.a(), { p1: 0 });
    assert.equal(map.b.c(), [0]);

    setMap.a.update({ p1: 1 });
    setMap.b.c.push(1);

    assert.equal(map.a(), { p1: 1 });
    assert.equal(map.b.c(), [0, 1]);

    dispose();
  });
});

test("Works with composed signals", () => {
  createRoot((dispose) => {
    const [map, setMap] = signalMap({
      a: {
        b: createHistory.wrap(createArray([0])),
      },
    });

    assert.equal(map.a.b(), [0]);
    assert.equal(map.a.b.history(), [[0]]);

    setMap.a.b.push(1);

    assert.equal(map.a.b(), [0, 1]);
    assert.equal(map.a.b.history(), [[0], [0, 1]]);

    assert.is(setMap.a.b.history.back(), true);

    assert.equal(map.a.b(), [0]);
    assert.equal(map.a.b.history(), [[0]]);
    assert.equal(map.a.b.history.forward(), [[0, 1]]);

    assert.is(setMap.a.b.history.back(), false);

    dispose();
  });
});

test.run();
