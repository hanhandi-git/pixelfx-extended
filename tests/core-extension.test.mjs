import test from "node:test";
import assert from "node:assert/strict";
import {
  createPath, quadraticBezier, cubicBezier, SDF, Painter, createFrame, clearFrame,
  windField, attractionField, vortexField, turbulenceField, combineFields, scaleField,
  stepField, fieldTrajectory, Particles, P, hex,
} from "../src/core/index.js";
import { Particles as SimpleParticles } from "../src/core/particles.js";
import * as flowSeal from "../src/fx/arcane/flow-seal.js";

const near = (a, b, epsilon = 1e-8) => assert.ok(Math.abs(a - b) <= epsilon, `${a} != ${b}`);

test("path progress measures distance, retaining corners, duplicate points and endpoint tangents", () => {
  const path = createPath([[0, 0], [0, 0], [3, 0], [3, 4]]);
  near(path.length, 7);
  assert.deepEqual(path.at(5), { x: 3, y: 2, tx: 0, ty: 1, nx: -1, ny: 0 });
  near(path.sample(-1).x, 0);
  near(path.sample(2).y, 4);
  near(path.at(0).tx, 1);
  near(path.at(7).ty, 1);
  const still = createPath([[2, 3], [2, 3]]);
  near(still.length, 0);
  near(still.at(100).x, 2);
  const loop = createPath([[0, 0], [4, 0], [4, 4]], { closed: true });
  assert.deepEqual(loop.sample(0), loop.sample(1));
  assert.deepEqual(loop.sample(-0.25), loop.sample(0.75));
});

test("Bezier endpoints and approximately constant travel on a nonuniform parameterization", () => {
  const curve = cubicBezier([0, 0], [0, 0], [0, 0], [100, 0]);
  const path = createPath(curve);
  for (let i = 0; i <= 10; i++) near(path.sample(i / 10).x, i * 10);
  const q = quadraticBezier([0, 0], [5, 10], [10, 0]);
  assert.deepEqual(q(0), [0, 0]);
  assert.deepEqual(q(0.5), [5, 5]);
  assert.deepEqual(q(1), [10, 0]);
  assert.throws(() => createPath([]));
  assert.throws(() => createPath([[NaN, 0]]));
  assert.throws(() => createPath(q, { samples: 0 }));
});

test("analytic SDFs compose shapes, borders and transforms with pixel distances", () => {
  const c = SDF.circle(0, 0, 5), b = SDF.box(0, 0, 4, 3);
  near(c(0, 0), -5); near(c(3, 4), 0); near(c(8, 0), 3);
  near(b(0, 0), -3); near(b(7, 7), 5);
  near(SDF.capsule(0, 0, 4, 0, 2)(2, 0), -2);
  near(SDF.capsule(0, 0, 0, 0, 2)(0, 3), 1);
  assert.ok(SDF.union(c, SDF.circle(8, 0, 2))(8, 0) < 0);
  assert.ok(SDF.intersect(c, b)(4.5, 0) > 0);
  assert.ok(SDF.subtract(c, SDF.circle(0, 0, 2))(0, 0) > 0);
  near(SDF.expand(c, 2)(7, 0), 0);
  near(SDF.expand(c, -2)(3, 0), 0);
  near(SDF.shell(c, 2)(5, 0), -1);
  near(SDF.translate(c, 10, 20)(10, 20), -5);
  near(SDF.rotate(b, Math.PI / 2)(0, 4), 0);
  near(SDF.scale(c, 2)(12, 0), 2);
});

test("mask distance transform agrees with a brute-force oracle, including solid and empty masks", () => {
  // Exercise non-square grids, isolated pixels, holes, and masks touching all four borders.
  for (const [w, h] of [[1, 1], [3, 7], [8, 4]]) for (const kind of [0, 1, 2, 3]) {
    const data = Uint8Array.from({ length: w * h }, (_, i) => kind === 0 ? 0 : kind === 1 ? 1
      : kind === 2 ? (i * 17 + 3) % 7 < 3 ? 1 : 0 : i % (w + 1) ? 1 : 0);
    const mask = { w, h, data }, field = SDF.fromMask(mask, 10, 20);
    for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) {
      const occupied = x >= 0 && x < w && y >= 0 && y < h && !!data[y * w + x];
      let squared = Infinity;
      for (let yy = -1; yy <= h; yy++) for (let xx = -1; xx <= w; xx++) {
        const other = xx >= 0 && xx < w && yy >= 0 && yy < h && !!data[yy * w + xx];
        if (other !== occupied) squared = Math.min(squared, (x - xx) ** 2 + (y - yy) ** 2);
      }
      const expected = occupied ? 0.5 - Math.sqrt(squared) : Math.sqrt(squared) - 0.5;
      const actual = field(10 + x + 0.5, 20 + y + 0.5);
      if (expected === Infinity) assert.equal(actual, Infinity);
      else near(actual, expected, 1e-6);
    }
    assert.deepEqual(SDF.toMask(field, w, h, 10, 20).data, data);
    assert.ok(field(-100, -100) > 0);
  }
});

test("distance functions feed the Painter under placement/rotation and keep light separate", () => {
  const f = createFrame(24, 24), p = new Painter(f), color = hex("#abcdef");
  const shape = SDF.subtract(SDF.circle(0, 0, 4), SDF.circle(0, 0, 2));
  p.place(12, 12, true, Math.PI / 2);
  p.sdf(shape, [-5, -5, 5, 5], color);
  assert.equal(p.get(0, 0), 0);
  assert.equal(p.get(3, 0) >>> 0, color >>> 0);
  assert.equal(f.light.some((v) => v !== 0), false);
  p.light(3, 0, color);
  assert.equal(f.light.some((v) => v !== 0), true);
  clearFrame(f);
  const path = createPath([[0, 0], [6, 0], [6, 6]]);
  p.place(4, 4);
  p.strokePath(path, 2, color, 1, 0, 0.5);
  assert.equal(p.get(3, 0) >>> 0, color >>> 0);
  assert.equal(p.get(6, 4), 0);
  clearFrame(f);
  p.place(12, 12, true, Math.PI / 2);
  p.strokePath(path, (u) => 1 + 2 * u, color);
  assert.equal(p.get(6, 4) >>> 0, color >>> 0);
  assert.equal(f.light.some((v) => v !== 0), false);
});

test("a stroked path shades its cross-section once, without seams at internal round caps", () => {
  const a = createFrame(24, 20), b = createFrame(24, 20);
  const color = (u, v) => v > 0.55 ? hex("#441166") : hex("#ddbbee");
  new Painter(a).strokePath(createPath([[3, 10], [10, 10], [20, 10]]), 6, color);
  new Painter(b).beam(3, 10, 20, 10, 6, color);
  assert.deepEqual(a.color, b.color);
});

test("field directions, radius, composition and seeded time sampling", () => {
  const a = attractionField(0, 0, 10, 10), v = vortexField(0, 0, 10, 10);
  assert.deepEqual(a(5, 0), [-5, 0]);
  assert.deepEqual(a(10, 0), [0, 0]);
  assert.deepEqual(a(0, 0), [0, 0]);
  const [vx, vy] = v(5, 0);
  near(vx, 0); near(vy, 5);
  assert.deepEqual(attractionField(0, 0, -10)(5, 0), [10, -0]);
  assert.deepEqual(combineFields(a, windField(3, 4))(5, 0), [-2, 4]);
  assert.deepEqual(scaleField(a, 2)(5, 0), [-10, 0]);
  assert.deepEqual(scaleField(a, (x, y, t) => t)(5, 0, 0), [-0, 0]);
  assert.deepEqual(combineFields()(5, 0), [0, 0]);
  const turbulence = turbulenceField({ seed: 7 });
  const first = turbulence(12, 8, 0.7);
  turbulence(-13, 1, 99);
  assert.deepEqual(turbulence(12, 8, 0.7), first);
  assert.notDeepEqual(turbulenceField({ seed: 8 })(12, 8, 0.7), first);
});

test("baked trajectories preserve time, can be sought, and converge to an analytic motion", () => {
  const initial = { x: 1, y: 2, vx: 3, vy: -4 }, field = windField(10, 20);
  const curve = fieldTrajectory(initial, field, 1, { hz: 1000 });
  assert.deepEqual(curve(0), [1, 2]);
  const [x, y] = curve(1);
  near(x, 1 + 3 + 0.5 * 10, 0.006);
  near(y, 2 - 4 + 0.5 * 20, 0.011);
  const atHalf = curve(0.5);
  curve(0.9); curve(0.1);
  assert.deepEqual(curve(0.5), atHalf);
  assert.deepEqual(initial, { x: 1, y: 2, vx: 3, vy: -4 });
  const path = createPath(curve);
  near(path.sample(1).x, x);
  // Absolute field time is the step's start, independent of trajectory's age.
  const timed = fieldTrajectory({ x: 0, y: 0, vx: 0, vy: 0 }, (x, y, t) => [t, 0], 1, { hz: 1, startTime: 2 });
  assert.deepEqual(timed(1), [2, 0]);
  assert.throws(() => stepField({ ...initial }, field, -1));
  assert.throws(() => fieldTrajectory(initial, field, 0));
});

test("both existing particle APIs accept optional local acceleration and skip delayed particles", () => {
  const basic = new SimpleParticles({ field: windField(12, 0) });
  basic.add({ x: 0, y: 0, vx: 0, vy: 0, life: 1 });
  basic.update(0.1);
  near(basic.list[0].vx, 1.2); near(basic.list[0].x, 0.12);
  const ps = new Particles({ field: windField(12, 0) });
  ps.spawn(P.MOTE, 0, 0, 0, 0, 1);
  ps.spawn(P.MOTE, 0, 0, 0, 0, 1, hex("#ffffff"), 1, 0.5);
  ps.update(0.1);
  assert.ok(ps.list[0].vx > 0);
  assert.equal(ps.list[1].vx, 0);
  const original = new Particles();
  original.spawn(P.MOTE, 0, 0, 0, 0, 1);
  original.update(0.1);
  assert.equal(original.list[0].vx, 0);
});

test("the combined effect loops both buffers and is independent of seed/cache and seek order", () => {
  const frame = createFrame(...flowSeal.meta.size), p = new Painter(frame);
  const render = (t, seed) => {
    clearFrame(frame);
    p.reset().place(...flowSeal.meta.origin);
    const options = { ...flowSeal.meta.options, seed };
    flowSeal.drawBack(p, t, options);
    flowSeal.draw(p, t, options);
    return [frame.color.slice(), frame.light.slice()];
  };
  const start = render(0, 7), middle = render(1.37, 7);
  render(3.7, 2); render(0.2, 3);
  assert.deepEqual(render(1.37, 7), middle);
  assert.deepEqual(render(flowSeal.meta.duration, 7), start);
});

test("dense frames sample geometry at half units while preserving world placement and the two buffers", () => {
  const f = createFrame(8, 6, 10, 20, 2), p = new Painter(f);
  assert.equal(f.w, 16);
  assert.equal(f.h, 12);
  p.place(10, 20);
  p.rect(0.5, 0.5, 0.5, 1, hex("#ff8040"));
  assert.equal(f.color.filter(Boolean).length, 2);
  assert.equal(p.get(0.5, 0.5), hex("#ff8040") >>> 0);
  assert.equal(f.light.filter(Boolean).length, 0);
  p.glow(2, 2, 1.5, hex("#20a0ff"), 0.5);
  assert.ok(f.light.filter(Boolean).length > 8);
  assert.equal(f.color.filter(Boolean).length, 2);
  assert.throws(() => createFrame(8, 8, 0, 0, 1.5), RangeError);
});

test("dense images keep their pivot through camera offsets, mirroring and rotation", () => {
  const red = hex("#f00") >>> 0, blue = hex("#00f") >>> 0;
  const src = new Uint32Array([red, blue, red, blue]);
  const f = createFrame(4, 4, 10, 20, 2), p = new Painter(f);
  p.place(11, 21).image(src, 2, 2, 0, 0, 2);
  assert.equal(f.color[2 * f.w + 2], red);
  assert.equal(f.color[2 * f.w + 3], blue);
  clearFrame(f);
  p.reset().place(11, 21, true).image(src, 2, 2, 0, 0, 2);
  assert.equal(f.color[2 * f.w], blue);
  assert.equal(f.color[2 * f.w + 1], red);
  clearFrame(f);
  p.reset().place(12, 21, false, Math.PI / 2).image(src, 2, 2, 0, 0, 2);
  assert.equal(f.color.filter(Boolean).length, 4);
});

test("renderScale samples a shape directly without losing thin source geometry", () => {
  const f = createFrame(8, 8, 0, 0, 2), p = new Painter(f);
  p.place(4, 4); p.scale = 0.5;
  p.rect(-2, -2, 1, 4, hex("#fff"));
  assert.equal(f.color.filter(Boolean).length, 4);
  p.glow(0, 0, 2, hex("#fff"));
  const extent = [];
  f.light.forEach((c, i) => { if (c) extent.push(i % f.w); });
  assert.ok(Math.max(...extent) - Math.min(...extent) <= 3);
});

test("dense sprite sheets export physical frame dimensions and matching pivots", async () => {
  const { renderFrames, spriteSheet } = await import("../tools/lib/fxlib.mjs");
  const fx = { id: "test/dense", meta: { size: [8, 6], origin: [2, 4], duration: 0.1, fps: 10, loop: false, options: {} },
    mod: { draw(p, t) { if (t < 0.1) p.rect(0, -1, 0.5, 1, hex("#fff")); } } };
  fx.mod.meta = fx.meta;
  const r = renderFrames(fx, { density: 2, bg: "none", actor: false });
  const sheet = spriteSheet(fx, r, "dense");
  assert.deepEqual(sheet.json.meta.pixelfx.frameSize, [16, 12]);
  assert.deepEqual(sheet.json.meta.pixelfx.pivot, [4, 8]);
  assert.equal(r.frames.at(-1).raw.filter(Boolean).length, 0);
});

test("weather shaders cover a dense output at the same world anchor", async () => {
  const { pass, rows } = await import("../src/fx/weather/_lib.js");
  const f = createFrame(12, 12, 0, 0, 2), p = new Painter(f).place(3, 4);
  const meta = { size: [4, 3], origin: [0, 0] }, white = hex("#fff") >>> 0;
  pass(p, meta, 0, 2, (_x, _y, out) => { out.c = white; });
  assert.equal(f.color.filter(Boolean).length, 4 * 3 * 4);
  assert.equal(f.color[8 * f.w + 6], white);
  clearFrame(f);
  rows(p, meta, 0, 2, (_y, out) => out.c.fill(white));
  assert.equal(f.color.filter(Boolean).length, 4 * 3 * 4);
  assert.equal(f.color[8 * f.w + 6], white);
});

test("clipped transition pixels keep dense placement and scale", async () => {
  const { clipTo, pixels } = await import("../src/fx/transitions/_lib.js");
  const f = createFrame(12, 12, 0, 0, 2), p = new Painter(f).place(3, 4);
  p.scale = 0.5;
  const pixel = pixels(clipTo(p));
  pixel.at(0); pixel.put(hex("#fff"));
  assert.equal(f.color.filter(Boolean).length, 1);
  assert.equal(f.color[8 * f.w + 6], hex("#fff") >>> 0);
});
