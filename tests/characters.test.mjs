import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { CHARACTERS, CHARACTER_TAILORING, characterOf, posed, stockActor, createAct, createFrame, clearFrame, actBounds } from "../src/core/index.js";
import * as slash from "../src/fx/melee/sword-slash.js";
import * as electrified from "../src/fx/lightning/electrified.js";
import { HERO_PIXEL_DATA } from "../src/core/dnf-pixel-data.js";
import { WEAPONS } from "../src/core/rig.js";

const digest = (buf) => createHash("sha256").update(new Uint8Array(buf.buffer)).digest("hex");
const blank = (onBody) => ({ meta: { duration: 1, actor: 2, size: [96, 96], origin: [48, 80] },
  act: { onBody, poses: [[0, {}], [1, {}]] }, draw() {} });
const picture = (mod, character, options = {}, t = 0.37) => {
  const a = createAct(mod, { x: 100, y: 100, character, ...options }), f = createFrame(320, 180);
  for (let i = 0; i < Math.round(t * 120); i++) a.update(1 / 120);
  a.draw(f); return { a, f };
};

test("the neutral DNF-style stand-in remains stable and unknown characters safely fall back", () => {
  assert.equal(digest(stockActor(2).pixels), "4ff154a85cbedc0a38471a7834ada413dc235fbf05717943d6689612c3b0334c");
  assert.equal(characterOf("missing").id, "dummy");
  assert.deepEqual(posed({}, "missing"), posed({}));
});

test("each costume has a different silhouette, consistent rest mask and separate cached poses", () => {
  const silhouettes = new Set();
  for (const c of CHARACTERS.slice(1)) {
    const r = posed({}, c.id), actor = stockActor(2, c.id);
    silhouettes.add([...r.xs].map((x, i) => `${x}:${r.ys[i]}`).sort().join(","));
    assert.equal(actor.mask.data.reduce((a, b) => a + b, 0), r.n);
    for (let i = 0; i < r.n; i++) {
      const j = (r.ys[i] - actor.y) * actor.w + r.xs[i] - actor.x;
      assert.equal(actor.pixels[j], r.color[i], c.id);
      assert(r.src[i] >= 0 && r.src[i] < actor.w * actor.h, `${c.id}: rest cell must have a source`);
    }
    const q = { weapon: "sword", fx: 12, fy: -22, yaw: 1.5 };
    assert.notEqual(posed(q, c.id), posed(q));
    assert.equal(posed(q, c.id), posed(q, c.id));
    assert.equal(stockActor(1, c.id).k, 1);
  }
  assert.equal(silhouettes.size, CHARACTERS.length - 1);
});

test("the DNF-inspired tailoring pass gives every named procedural look an editable hair and coat recipe", () => {
  for (const look of CHARACTERS.filter((character) => character.style && !character.sprite)) {
    const design = CHARACTER_TAILORING[look.id];
    assert.ok(design, look.id);
    assert.ok(design.hair && design.coat, look.id);
    const pose = posed({}, look.id, { density: 2 });
    assert.ok(pose.n > 1200, `${look.id}: dense costume should retain authored detail`);
  }
});

test("the five Ember Echo DNF code-pixel characters are part of the pixelfx roster", () => {
  const dnf = CHARACTERS.filter((look) => look.sprite);
  assert.deepEqual(dnf.map((look) => look.id), [
    "dnf-blade-master", "dnf-berserker", "dnf-sword-master", "dnf-elementalist", "dnf-elemental-bomber",
  ]);
  for (const look of dnf) {
    const body = posed({}, look.id);
    const actor = stockActor(2, look.id);
    assert.ok(body.n > 500, `${look.id}: source pixels should survive import`);
    assert.equal(actor.mask.data.reduce((sum, value) => sum + value, 0), body.n, look.id);
    assert.ok(body.src.every((source) => source >= 0 && source < actor.w * actor.h), `${look.id}: source map`);
  }
});

test("every DNF character changes its visible equipment for every weapon and restores an unarmed body", () => {
  for (const look of CHARACTERS.filter((look) => look.sprite)) {
    const body = posed({}, look.id, { density: 2 }), before = digest(body.color);
    for (const pose of [{}, { fx: 20, fy: -22, sa: -0.4 }]) {
      const signatures = new Set();
      for (const weapon of Object.keys(WEAPONS)) {
        const equipped = posed({ ...pose, weapon }, look.id, { density: 2 });
        signatures.add(digest(equipped.color) + digest(equipped.xs) + digest(equipped.ys));
        assert.equal(equipped.weapon, weapon, `${look.id}/${weapon}`);
        assert.ok([...equipped.src].some((source) => source === -1), "equipment has independent pixels");
        assert.equal(equipped, posed({ ...pose, weapon }, look.id, { density: 2 }));
      }
      assert.equal(signatures.size, Object.keys(WEAPONS).length, `${look.id}: distinct visible weapons`);
    }
    assert.equal(digest(posed({}, look.id, { density: 2 }).color), before, `${look.id}: changing equipment mutated the body`);
  }
});

test("all 201 DNF body frames match the separate unarmed source and keep their grips on body pixels", () => {
  const sources = JSON.parse(readFileSync(new URL("../tools/dnf-body-sources.json", import.meta.url)));
  let checked = 0;
  for (const source of sources) for (const [frameId, expected] of Object.entries(source.frames)) {
    const frame = HERO_PIXEL_DATA[source.id].frames[frameId];
    const body = posed({ spriteFrame: Number(frameId) }, source.id, { density: 2 });
    const pixels = Buffer.alloc(frame.width * frame.height * 4);
    for (let i = 0; i < body.n; i++) {
      const x = Math.round(body.xs[i] * 2) - frame.offset[0], y = Math.round(body.ys[i] * 2) - frame.offset[1];
      pixels.writeUInt32LE(body.color[i], (y * frame.width + x) * 4);
    }
    assert.equal(createHash("sha256").update(pixels).digest("hex"), expected.sha256, `${source.id}/${frameId}`);
    assert.ok([...body.xs].some((x, i) => x * 2 === frame.grip[0] && body.ys[i] * 2 === frame.grip[1]), `${source.id}/${frameId}: grip detached`);
    checked++;
  }
  assert.equal(checked, 201);
});

test("an untouched body effect preserves costume colors and works mirrored", () => {
  for (const c of CHARACTERS) for (const flip of [false, true]) {
    const normal = picture(blank(false), c.id, { flip }).f;
    const carried = picture(blank(true), c.id, { flip }).f;
    assert.equal(digest(carried.color), digest(normal.color), c.id);
  }
});

test("body-bound electricity follows each costume deterministically through a moving pose", () => {
  for (const c of CHARACTERS) {
    const mod = { ...electrified, act: { ...electrified.act, onBody: true,
      poses: [[0, { fx: -8, fy: -31, turn: 1 }], [electrified.meta.duration, { fx: -8, fy: -31, turn: 1 }]] } };
    for (const flip of [false, true]) {
      const a = picture(mod, c.id, { flip }).f, b = picture(mod, c.id, { flip }).f;
      assert.equal(digest(a.color), digest(b.color), c.id);
      assert.equal(digest(a.light), digest(b.light), c.id);
      assert(a.color.some((v) => v));
    }
  }
});

test("changing costume preserves hit-stop, event times, completion and mirrored drawing", () => {
  const expected = [];
  for (const c of CHARACTERS) {
    const act = createAct(slash, { character: c.id }), f = createFrame(400, 240);
    const hits = []; act.onHit = (hit) => hits.push(hit.t);
    let steps = 0, frozen = 0;
    while (!act.done() && steps < 600) {
      act.update(1 / 60); if (act.frozen) frozen++;
      if (steps % 6 === 0) act.draw(clearFrame(f));
      steps++;
    }
    assert(act.done()); assert(hits.length > 0); assert(frozen > 0);
    const result = { hits, frozen, steps };
    if (c.id === "dummy") expected.push(result);
    else assert.deepEqual(result, expected[0]);
    const bounds = actBounds(slash, { character: c.id });
    const r = posed(slash.act.poses[0][1], c.id);
    assert(bounds.y0 <= r.y0 && bounds.x0 <= r.x0 && bounds.x1 > r.x1);
    const left = picture(blank(false), c.id, { flip: true }).f;
    const right = picture(blank(false), c.id).f;
    for (let y = 45; y < 99; y++) for (let x = 65; x < 135; x++)
      assert.equal(left.color[y * 320 + x], right.color[y * 320 + 199 - x], c.id);
  }
});

test("dense costume poses resample geometry and keep cache entries separate from legacy pixels", () => {
  for (const c of CHARACTERS) {
    const pose = { weapon: "sword", fx: 12, fy: -21 };
    const legacy = posed(pose, c.id), before = digest(legacy.color);
    const dense = posed(pose, c.id, { density: 2 });
    assert.equal(dense.density, 2);
    assert.ok(dense.n > legacy.n * 2, c.id);
    assert.ok([...dense.xs, ...dense.ys].some(v => v % 1 !== 0), c.id);
    assert.ok(Math.abs(dense.x0 - legacy.x0) <= 2 && Math.abs(dense.y0 - legacy.y0) <= 4, c.id);
    assert.equal(posed(pose, c.id), legacy);
    assert.equal(digest(legacy.color), before);
    assert.equal(posed(pose, c.id, { density: 2 }), dense);
  }
});

test("dense acts retain timing and mirror both the costume and effect around their world anchor", () => {
  const mod = { meta: { duration: 1, size: [80, 80], origin: [40, 70] },
    act: { poses: [[0, {}], [1, {}]] }, draw(p) { p.rect(10, -20, 0.5, 1, 0xffffffff); } };
  const pictures = [];
  for (const flip of [false, true]) {
    const a = createAct(mod, { x: 50, y: 70, character: "ember-duelist", flip });
    const f = createFrame(100, 90, 0, 0, 2);
    a.update(0.2); a.draw(f); pictures.push(f);
    assert.equal(a.t, 0.2);
    assert.ok(f.color.filter(Boolean).length > 1000);
  }
  // The screen-space Bayer pattern of the contact shadow stays anchored to the screen.
  for (let y = 0; y < 136; y++) for (let x = 0; x < pictures[0].w; x++) {
    assert.equal(pictures[0].color[y * pictures[0].w + x], pictures[1].color[y * pictures[1].w + pictures[1].w - 1 - x]);
  }
});
