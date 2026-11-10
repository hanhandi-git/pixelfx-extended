import test from "node:test";
import assert from "node:assert/strict";
import { goblinAction } from "../src/fx/mobs/_goblin.js";

test("goblin walk plants one foot while lifting the opposite foot", () => {
  const a = goblinAction(0, 2.8, { pose: "walk", walkDistance: 2, walkStride: 5 });
  const b = goblinAction(0, 2.8, { pose: "walk", walkDistance: 6, walkStride: 5 });
  assert.equal(a.bob + a.hop + a.feet.R.y, 0);
  assert.ok(a.bob + a.hop + a.feet.L.y < -1);
  assert.ok(Math.abs((a.shift + a.feet.R.x) - (b.shift + b.feet.R.x) - 4) < 1e-8);
});

test("goblin walk loops exactly and cast/hurt/death do not inherit walking feet", () => {
  const start = goblinAction(0, 2.8, { pose: "walk", walkDistance: 0, walkStride: 5 });
  const end = goblinAction(0, 2.8, { pose: "walk", walkDistance: 20, walkStride: 5 });
  assert.deepEqual(start, end);
  for (const pose of ["idle", "cast", "hurt", "die"]) {
    assert.equal(goblinAction(0, 2.8, { pose, walkDistance: 2 }).feet, undefined);
  }
});
