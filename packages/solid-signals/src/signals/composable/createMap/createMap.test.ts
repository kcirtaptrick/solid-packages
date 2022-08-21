import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import createHistory from "../createHistory";
import createMap from "./createMap";

const test = suite("createMap");

test("Creates map signal", () => {
  createRoot((dispose) => {
    const [map, setMap] = createMap();

    assert.equal(map(), new Map());

    dispose();
  });
});

test("Creates map signal with initial value", () => {
  createRoot((dispose) => {
    {
      const [map, setMap] = createMap(new Map([["key1", "value1"]]));

      assert.equal(map(), new Map([["key1", "value1"]]));
    }
    {
      const [map, setMap] = createMap([["key1", "value1"]]);

      assert.equal(map(), new Map([["key1", "value1"]]));
    }

    dispose();
  });
});

test("Preserve Solid setter", () => {
  createRoot((dispose) => {
    const [map, setMap] = createMap();

    setMap(new Map());

    assert.equal(map(), new Map());

    dispose();
  });
});

test("set: Adds or updates an entry with a specified key", () => {
  createRoot((dispose) => {
    const [map, setMap] = createMap<string, string>();

    const res = setMap.set("key1", "value1");
    assert.equal(map(), new Map([["key1", "value1"]]));
    // Returns new map
    assert.equal(res, map());

    setMap.set("key2", "value2");
    assert.equal(
      map(),
      new Map([
        ["key1", "value1"],
        ["key2", "value2"],
      ])
    );

    setMap.set("key1", "value1 updated");
    assert.equal(
      map(),
      new Map([
        ["key1", "value1 updated"],
        ["key2", "value2"],
      ])
    );

    dispose();
  });
});

test("delete: Removes entry from map by key", () => {
  createRoot((dispose) => {
    const [map, setMap] = createMap([
      ["key1", "value1"],
      ["key2", "value2"],
    ]);
    {
      const res = setMap.delete("key1");
      assert.equal(map(), new Map([["key2", "value2"]]));
      // Returns key presence
      assert.equal(res, true);
    }
    {
      const res = setMap.delete("key1");
      assert.equal(res, false);
    }
    {
      const res = setMap.delete("doesn't exist");
      assert.equal(res, false);
    }
    {
      const res = setMap.delete("key2");
      assert.equal(map(), new Map());
      // Returns key presence
      assert.equal(res, true);
    }

    dispose();
  });
});

test("clear: removes all entries from map", () => {
  createRoot((dispose) => {
    {
      const [map, setMap] = createMap();

      setMap.clear();
      assert.equal(map(), new Map());
    }
    {
      const [map, setMap] = createMap([["key2", "value2"]]);

      setMap.clear();
      assert.equal(map(), new Map());
    }
    {
      const [map, setMap] = createMap([
        ["key1", "value1"],
        ["key2", "value2"],
      ]);

      setMap.clear();
      assert.equal(map(), new Map());
    }

    dispose();
  });
});

test("Extends other signals (createHistory)", () => {
  createRoot((dispose) => {
    const [map, setMap] = createMap.wrap(
      createHistory(new Map<string, string>())
    );

    setMap.set("key1", "value1");
    setMap.set("key1", "value2");
    setMap.set("key1", "value3");
    assert.equal(map(), new Map([["key1", "value3"]]));
    assert.equal(map.history(), [
      new Map(),
      new Map([["key1", "value1"]]),
      new Map([["key1", "value2"]]),
      new Map([["key1", "value3"]]),
    ]);
    assert.equal(map.history.forward(), []);

    assert.is(setMap.history.back(), true);
    assert.equal(map(), new Map([["key1", "value2"]]));
    assert.equal(map.history(), [
      new Map(),
      new Map([["key1", "value1"]]),
      new Map([["key1", "value2"]]),
    ]);
    assert.equal(map.history.forward(), [new Map([["key1", "value3"]])]);

    assert.is(setMap.history.back(), true);
    assert.is(setMap.history.back(), true);
    assert.equal(map(), new Map());
    assert.equal(map.history(), [new Map()]);
    assert.equal(map.history.forward(), [
      new Map([["key1", "value1"]]),
      new Map([["key1", "value2"]]),
      new Map([["key1", "value3"]]),
    ]);

    assert.is(setMap.history.back(), false);

    assert.is(setMap.history.forward(), true);
    assert.equal(map(), new Map([["key1", "value1"]]));
    assert.equal(map.history(), [new Map(), new Map([["key1", "value1"]])]);
    assert.equal(map.history.forward(), [
      new Map([["key1", "value2"]]),
      new Map([["key1", "value3"]]),
    ]);

    assert.is(setMap.history.forward(), true);
    assert.is(setMap.history.forward(), true);
    assert.equal(map(), new Map([["key1", "value3"]]));
    assert.equal(map.history(), [
      new Map(),
      new Map([["key1", "value1"]]),
      new Map([["key1", "value2"]]),
      new Map([["key1", "value3"]]),
    ]);
    assert.equal(map.history.forward(), []);

    assert.is(setMap.history.forward(), false);

    dispose();
  });
});

test.run();
