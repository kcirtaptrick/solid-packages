import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import createTable from ".";
import createArray from "../createArray";
import createHistory from "../createHistory";

const test = suite("createTable");

test("Creates object array signal", () => {
  createRoot((dispose) => {
    const [table, setTable] = createTable([{ a: "a" }]);

    assert.equal(table(), [{ a: "a" }]);

    dispose();
  });
});

test("Preserve Solid setter", () => {
  createRoot((dispose) => {
    const [table, setTable] = createTable([{ a: "a" }]);

    setTable([{ a: "a1" }]);
    assert.equal(table(), [{ a: "a1" }]);

    dispose();
  });
});

test("state.findBy: Find item by partial", () => {
  createRoot((dispose) => {
    const [table, setTable] = createTable([
      { a: "a1", b: "b1" },
      { a: "a2", b: "b2" },
    ]);

    assert.equal(table.findBy({ a: "a1" }), { a: "a1", b: "b1" });
    assert.equal(table.findBy({ a: "a2" }), { a: "a2", b: "b2" });
    assert.equal(table.findBy({ b: "b1" }), { a: "a1", b: "b1" });
    assert.equal(table.findBy({ b: "b2" }), { a: "a2", b: "b2" });
    assert.equal(table.findBy({ a: "a1", b: "b1" }), {
      a: "a1",
      b: "b1",
    });
    assert.equal(table.findBy({ a: "a-1" }), undefined);
    assert.equal(table.findBy({ b: "b-1" }), undefined);
    assert.equal(table.findBy({ a: "a1", b: " b2" }), undefined);

    setTable([
      { a: "a3", b: "b3" },
      { a: "a4", b: "b4" },
    ]);
    assert.equal(table.findBy({ a: "a1" }), undefined);
    assert.equal(table.findBy({ a: "a2" }), undefined);
    assert.equal(table.findBy({ b: "b1" }), undefined);
    assert.equal(table.findBy({ b: "b2" }), undefined);
    assert.equal(table.findBy({ a: "a3" }), { a: "a3", b: "b3" });
    assert.equal(table.findBy({ a: "a4" }), { a: "a4", b: "b4" });
    assert.equal(table.findBy({ b: "b3" }), { a: "a3", b: "b3" });
    assert.equal(table.findBy({ b: "b4" }), { a: "a4", b: "b4" });

    dispose();
  });
});

test("state.findAllBy: Find all items by partial", () => {
  createRoot((dispose) => {
    const [table, setTable] = createTable([
      { a: "a1", b: "b1" },
      { a: "a2", b: "b2" },
      { a: "a2", b: "b2-1" },
    ]);

    assert.equal(table.findAllBy({ a: "a1" }), [{ a: "a1", b: "b1" }]);
    assert.equal(table.findAllBy({ a: "a2" }), [
      { a: "a2", b: "b2" },
      { a: "a2", b: "b2-1" },
    ]);
    assert.equal(table.findAllBy({ a: "a2", b: "b2" }), [
      {
        a: "a2",
        b: "b2",
      },
    ]);
    assert.equal(table.findAllBy({ a: "doesn't exist" }), []);

    setTable([
      { a: "a3", b: "b3" },
      { a: "a4", b: "b4" },
    ]);
    assert.equal(table.findAllBy({ a: "a1" }), []);
    assert.equal(table.findAllBy({ a: "a3" }), [{ a: "a3", b: "b3" }]);
    assert.equal(table.findAllBy({ a: "a4" }), [{ a: "a4", b: "b4" }]);
    assert.equal(table.findAllBy({ b: "b3" }), [{ a: "a3", b: "b3" }]);
    assert.equal(table.findAllBy({ b: "b4" }), [{ a: "a4", b: "b4" }]);

    dispose();
  });
});

test("state.findIndexBy: Find index by partial", () => {
  createRoot((dispose) => {
    const [table, setTable] = createTable([
      { a: "a1", b: "b1" },
      { a: "a2", b: "b2" },
    ]);

    assert.equal(table.findIndexBy({ a: "a1" }), 0);
    assert.equal(table.findIndexBy({ a: "a2" }), 1);
    assert.equal(table.findIndexBy({ b: "b1" }), 0);
    assert.equal(table.findIndexBy({ b: "b2" }), 1);
    assert.equal(table.findIndexBy({ a: "doesn't exist" }), -1);
    assert.equal(table.findIndexBy({ b: "doesn't exist" }), -1);
    assert.equal(table.findIndexBy({ a: "a1", b: " b2" }), -1);

    setTable([
      { a: "a3", b: "b3" },
      { a: "a4", b: "b4" },
    ]);
    assert.equal(table.findIndexBy({ a: "a1" }), -1);
    assert.equal(table.findIndexBy({ a: "a2" }), -1);
    assert.equal(table.findIndexBy({ b: "b1" }), -1);
    assert.equal(table.findIndexBy({ b: "b2" }), -1);
    assert.equal(table.findIndexBy({ a: "a3" }), 0);
    assert.equal(table.findIndexBy({ a: "a4" }), 1);
    assert.equal(table.findIndexBy({ b: "b3" }), 0);
    assert.equal(table.findIndexBy({ b: "b4" }), 1);

    dispose();
  });
});

test("setState.by: Finds and sets item by partial", () => {
  createRoot((dispose) => {
    const [table, setTable] = createTable([
      { a: "a1", b: "b1" },
      { a: "a1", b: "b1-1" },
      { a: "a2", b: "b2" },
    ]);

    assert.is(setTable.by({ a: "a1" }, { a: "a3", b: "b3" }), table()[0]);
    assert.equal(table(), [
      { a: "a3", b: "b3" },
      { a: "a1", b: "b1-1" },
      { a: "a2", b: "b2" },
    ]);

    dispose();
  });
});

test("setState.allBy: Finds and sets items by partial", () => {
  createRoot((dispose) => {
    const [table, setTable] = createTable([
      { a: "a1", b: "b1" },
      { a: "a1", b: "b1-1" },
      { a: "a2", b: "b2" },
    ]);

    setTable.allBy({ a: "a1" }, { a: "a3", b: "b3" });
    assert.equal(table(), [
      { a: "a3", b: "b3" },
      { a: "a3", b: "b3" },
      { a: "a2", b: "b2" },
    ]);

    dispose();
  });
});

test("setState.update: Updates item at given index by partial", () => {
  createRoot((dispose) => {
    const [table, setTable] = createTable([
      { a: "a1", b: "b1" },
      { a: "a2", b: "b2" },
    ]);

    assert.is(setTable.update(0, { a: "a3" }), table()[0]);
    assert.equal(table(), [
      { a: "a3", b: "b1" },
      { a: "a2", b: "b2" },
    ]);

    dispose();
  });
});

test("setState.updateBy: Finds and updates item by partial", () => {
  createRoot((dispose) => {
    const [table, setTable] = createTable([
      { a: "a1", b: "b1" },
      { a: "a1", b: "b1-1" },
      { a: "a2", b: "b2" },
    ]);

    assert.is(setTable.updateBy({ a: "a1" }, { a: "a3" }), table()[0]);
    assert.equal(table(), [
      { a: "a3", b: "b1" },
      { a: "a1", b: "b1-1" },
      { a: "a2", b: "b2" },
    ]);
    assert.is(setTable.updateBy({ a: "a3" }, { b: "b3" }), table()[0]);
    assert.equal(table(), [
      { a: "a3", b: "b3" },
      { a: "a1", b: "b1-1" },
      { a: "a2", b: "b2" },
    ]);

    dispose();
  });
});

test("setState.updateAllBy: Finds and updates items by partial", () => {
  createRoot((dispose) => {
    const [table, setTable] = createTable([
      { a: "a1", b: "b1", c: "c1" },
      { a: "a1", b: "b1-1", c: "c1-1" },
      { a: "a2", b: "b2", c: "c2" },
    ]);

    setTable.updateAllBy({ a: "a1" }, { b: "b3" });
    assert.equal(table(), [
      { a: "a1", b: "b3", c: "c1" },
      { a: "a1", b: "b3", c: "c1-1" },
      { a: "a2", b: "b2", c: "c2" },
    ]);
    setTable.updateAllBy({ a: "a1" }, { b: "b4", c: "c4" });
    assert.equal(table(), [
      { a: "a1", b: "b4", c: "c4" },
      { a: "a1", b: "b4", c: "c4" },
      { a: "a2", b: "b2", c: "c2" },
    ]);

    dispose();
  });
});

test("Extends other signals (createHistory)", () => {
  createRoot((dispose) => {
    const initial = [
      { a: "a1", b: "b1" },
      { a: "a2", b: "b2" },
    ];

    const [table, setTable] = createTable.wrap(createHistory(initial));

    assert.equal(table(), initial);

    setTable.updateBy({ a: "a1" }, { b: "b3" });
    setTable.updateBy({ a: "a1" }, { a: "a2" });
    setTable.updateAllBy({ a: "a2" }, { b: "b4" });
    assert.equal(table(), [
      { a: "a2", b: "b4" },
      { a: "a2", b: "b4" },
    ]);
    assert.equal(table.history(), [
      initial,
      [
        { a: "a1", b: "b3" },
        { a: "a2", b: "b2" },
      ],
      [
        { a: "a2", b: "b3" },
        { a: "a2", b: "b2" },
      ],
      [
        { a: "a2", b: "b4" },
        { a: "a2", b: "b4" },
      ],
    ]);
    assert.equal(table.history.forward(), []);

    assert.is(setTable.history.back(), true);
    assert.equal(table(), [
      { a: "a2", b: "b3" },
      { a: "a2", b: "b2" },
    ]);
    assert.equal(table.history(), [
      initial,
      [
        { a: "a1", b: "b3" },
        { a: "a2", b: "b2" },
      ],
      [
        { a: "a2", b: "b3" },
        { a: "a2", b: "b2" },
      ],
    ]);
    assert.equal(table.history.forward(), [
      [
        { a: "a2", b: "b4" },
        { a: "a2", b: "b4" },
      ],
    ]);

    assert.is(setTable.history.back(), true);
    assert.is(setTable.history.back(), true);
    assert.is(table(), initial);
    assert.equal(table.history(), [initial]);
    assert.equal(table.history.forward(), [
      [
        { a: "a1", b: "b3" },
        { a: "a2", b: "b2" },
      ],
      [
        { a: "a2", b: "b3" },
        { a: "a2", b: "b2" },
      ],
      [
        { a: "a2", b: "b4" },
        { a: "a2", b: "b4" },
      ],
    ]);

    assert.is(setTable.history.back(), false);

    assert.is(setTable.history.forward(), true);
    assert.equal(table(), [
      { a: "a1", b: "b3" },
      { a: "a2", b: "b2" },
    ]);
    assert.equal(table.history(), [
      initial,
      [
        { a: "a1", b: "b3" },
        { a: "a2", b: "b2" },
      ],
    ]);
    assert.equal(table.history.forward(), [
      [
        { a: "a2", b: "b3" },
        { a: "a2", b: "b2" },
      ],
      [
        { a: "a2", b: "b4" },
        { a: "a2", b: "b4" },
      ],
    ]);

    assert.is(setTable.history.forward(), true);
    assert.is(setTable.history.forward(), true);
    assert.equal(table(), [
      { a: "a2", b: "b4" },
      { a: "a2", b: "b4" },
    ]);
    assert.equal(table.history(), [
      initial,
      [
        { a: "a1", b: "b3" },
        { a: "a2", b: "b2" },
      ],
      [
        { a: "a2", b: "b3" },
        { a: "a2", b: "b2" },
      ],
      [
        { a: "a2", b: "b4" },
        { a: "a2", b: "b4" },
      ],
    ]);
    assert.equal(table.history.forward(), []);

    assert.is(setTable.history.forward(), false);

    dispose();
  });
});

test("Multiple extension", () => {
  const initial = [{ a: "a1", b: "b2" }];
  const [state, setState] = createHistory.wrap(
    createTable.wrap(createArray(initial))
  );

  assert.equal(state(), initial);
  assert.equal(state.history(), [initial]);

  setState.push({ a: "a2", b: "b2" });
  assert.equal(state(), [...initial, { a: "a2", b: "b2" }]);
  assert.equal(state.history(), [initial, [...initial, { a: "a2", b: "b2" }]]);

  setState.updateBy({ a: "a2" }, { b: "b3" });
  assert.equal(state(), [...initial, { a: "a2", b: "b3" }]);
  assert.equal(state.history(), [
    initial,
    [...initial, { a: "a2", b: "b2" }],
    [...initial, { a: "a2", b: "b3" }],
  ]);

  setState.history.back();
  assert.equal(state(), [...initial, { a: "a2", b: "b2" }]);
  assert.equal(state.history(), [initial, [...initial, { a: "a2", b: "b2" }]]);
  assert.equal(state.history.forward(), [[...initial, { a: "a2", b: "b3" }]]);
});

test.run();
