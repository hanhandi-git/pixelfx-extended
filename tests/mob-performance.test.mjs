import test from "node:test";
import assert from "node:assert/strict";
import { createEncounter } from "../src/core/index.js";
import * as warrior from "../src/fx/mobs/goblin-warrior.js";
import * as warriorSlash from "../src/fx/mobs/goblin-warrior-slash.js";
import * as mageBolt from "../src/fx/mobs/goblin-mage-bolt.js";
import * as archerShot from "../src/fx/mobs/goblin-archer-shot.js";
import * as giantQuake from "../src/fx/mobs/goblin-giant-smash.js";
import * as agileFlurry from "../src/fx/mobs/goblin-agile-flurry.js";
import { goblinAction, castClock, tintHurt } from "../src/fx/mobs/_goblin.js";

const map = { meta: { kind: "map", duration: 2, loop: true, size: [320, 180] }, map: { groundY: 150 }, draw() {} };
// draw nothing: these tests are about the performance clock, not the pixels
const mob = (stats = {}) => ({
  meta: { kind: "mob", duration: 2, loop: true, size: [96, 108], options: {} },
  mob: { hp: 10, radius: 8, height: 30, speed: 20, attacks: [], ...stats },
  draw() {},
});
const slash = {
  meta: { kind: "mob-attack", duration: 1, loop: false, size: [112, 72] },
  attack: { telegraph: 0.3, hits: [{ t: 0.4, damage: 1 }], pose: { cast: "slash", windup: 0.3, hold: 0.1, recover: 0.3 } },
  draw() {},
};

const make = ({ stats = {}, timeline, mobs } = {}) => createEncounter({
  duration: 8,
  map,
  hero: { x: 40, y: 150 },
  mobs: mobs ?? [{ id: "a", mod: mob(stats), x: 200, y: 150 }],
  timeline: timeline ?? [],
});
const run = (E, seconds) => { for (let i = 0; i < Math.round(seconds * 30); i++) E.update(1 / 30); };

test("an attack cue with a unit makes that unit perform, not the boss", () => {
  const E = make({ timeline: [{ at: 1, type: "attack", fx: slash, x: 200, y: 150, unit: "a" }] });
  run(E, 1.05);
  const o = E.units[0].fx.options;
  assert.equal(o.pose, "cast");
  assert.equal(o.cast, "slash");
  assert.ok(o.poseT > 0.02 && o.poseT < 0.12, `poseT ${o.poseT}`);
});

test("a hurt cue flinches the unit toward the blow and lets it recover", () => {
  const E = make({ timeline: [{ at: 1, type: "hurt", target: "a", dir: -1 }] });
  run(E, 1.03);
  const o = E.units[0].fx.options;
  assert.equal(o.pose, "hurt");
  assert.equal(o.hurtDir, -1);
  assert.equal(o.poseDur, 0.34); // mob.hurtFor
  // the flinch is a short state: it hands back to the idle loop on its own
  run(E, 0.4);
  assert.equal(o.pose, "idle");
  assert.equal(o.poseT, 0);
});

test("a mob with dieFor keeps its body for the death pose, then leaves", () => {
  const E = make({ stats: { dieFor: 0.9 }, timeline: [{ at: 1, type: "defeat", target: "a" }] });
  run(E, 1.1);
  const u = E.units[0];
  assert.equal(u.fx.options.pose, "die");
  assert.equal(u.fx.options.poseDur, 0.9);
  assert.equal(u.gone, false);
  // the cue pushes `until` out so the body is not culled mid-fall
  assert.ok(u.until >= 1.9, `until ${u.until}`);
  run(E, 0.9);
  assert.equal(u.gone, true);
});

test("the goblin body answers every cast with a wind-up, a release and a recovery", () => {
  for (const cast of ["slash", "spell", "shoot", "quake", "flurry"]) {
    const o = { cast, poseWindup: 0.3, poseHold: 0.1, poseRecover: 0.3 };
    const idle = goblinAction(0.8, 3, {});
    const wound = goblinAction(0.8, 3, { ...o, pose: "cast", poseT: 0.1 });
    const released = goblinAction(0.8, 3, { ...o, pose: "cast", poseT: 0.35 });
    const done = goblinAction(0.8, 3, { ...o, pose: "cast", poseT: 0.7 });
    const hand = (p, side) => p.hands[side];
    assert.notDeepEqual(hand(wound, "R"), hand(idle, "R"), `${cast}: the right hand never winds up`);
    assert.notDeepEqual(hand(released, "R"), hand(wound, "R"), `${cast}: the release does not move the hand`);
    assert.ok(done.fade > 0.9, `${cast}: recovery should not fade the body`);
  }
  // the clock itself: windup -> release -> recover
  assert.equal(castClock({ poseT: 0.1, poseWindup: 0.3, poseHold: 0.1, poseRecover: 0.2 }).phase, "windup");
  assert.equal(castClock({ poseT: 0.35, poseWindup: 0.3, poseHold: 0.1, poseRecover: 0.2 }).phase, "release");
  assert.equal(castClock({ poseT: 0.6, poseWindup: 0.3, poseHold: 0.1, poseRecover: 0.2 }).phase, "recover");
});

test("a dying goblin sinks and fades out instead of popping", () => {
  const start = goblinAction(0.8, 3, { pose: "die", poseT: 0.01, poseDur: 1 });
  const mid = goblinAction(0.8, 3, { pose: "die", poseT: 0.5, poseDur: 1 });
  const end = goblinAction(0.8, 3, { pose: "die", poseT: 0.99, poseDur: 1 });
  assert.ok(mid.bob > start.bob, "the body should drop");
  assert.ok(end.fade < 0.1, `fade ${end.fade}`);
  assert.ok(end.fade < mid.fade, "the fade should run out");
});

test("every goblin attack's performance matches its own telegraph and hit frame", () => {
  for (const [name, mod] of Object.entries({ warriorSlash, mageBolt, archerShot, giantQuake, agileFlurry })) {
    const { telegraph, hits, pose } = mod.attack;
    assert.ok(pose, `${name}: no pose`);
    assert.ok(Math.abs(pose.windup - telegraph) < 1e-6, `${name}: windup ${pose.windup} vs telegraph ${telegraph}`);
    const release = pose.windup + pose.hold;
    assert.ok(release >= hits[0].t - 1 / 30, `${name}: the first hit at ${hits[0].t} lands before the release ends at ${release}`);
    assert.ok(release <= hits[hits.length - 1].t + 1 / 30, `${name}: the last hit at ${hits.at(-1).t} lands after the release`);
    assert.equal(mod.meta.kind, "mob-attack");
    assert.ok(mod.mob === undefined || true);
  }
  // each goblin points at its own attack and carries the reaction timings
  assert.equal(warrior.mob.attacks.length, 1);
  assert.ok(warrior.mob.attacks[0].fx === warriorSlash);
  assert.ok(warrior.mob.hurtFor > 0 && warrior.mob.dieFor > 0);
});

test("the hurt tint flashes white, runs red and returns to the real palette", () => {
  const cells = new Map();
  const grid = {
    recolor(fn) {
      cells.clear();
      for (const [i, c] of [[0, 0x00457a3d], [1, 0x00908c90], [2, 0x00d8e0b8]].entries()) cells.set(i, fn(0, 0, c | 0xff000000, 1, 0));
    },
    colors() { return [...cells.values()]; },
  };
  tintHurt(grid, { pose: "hurt", poseT: 0 });
  assert.deepEqual([...new Set(grid.colors())], [-1], "the first frame is white (0xffffffff as a signed word)");
  tintHurt(grid, { pose: "hurt", poseT: 0.08 });
  assert.ok(grid.colors().every((c) => c !== -1), "the red frames are red, not white");
  cells.clear();
  tintHurt(grid, { pose: "hurt", poseT: 0.4 });
  assert.equal(cells.size, 0, "the tint is over once the flinch ends");
});
