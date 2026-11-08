#!/usr/bin/env node
// A minion's whole combat set on one sheet: the idle loop, its own attack (body pose + effect), the flinch when it
// is hit, and the death it falls into. This is the review tool for "does the unit react?", not for one effect.
//
//   node tools/mob.mjs mobs/goblin-warrior
//   node tools/mob.mjs "mobs/goblin-*" --zoom 5
//
// Writes records/mobs/<name>/combat.png. The attack row plays the module named by mob.attacks[0].fx the way the
// encounter runtime does: the unit performs attack.pose while the effect runs from the same start time.

import { join } from "node:path";
import { ROOT, resolveIds, loadEffect, save, canvas } from "./lib/fxlib.mjs";
import { createFrame, clearFrame, painterFor, composite, resolveOptions, backdrop } from "../src/core/index.js";

const args = process.argv.slice(2), flags = {}, ids = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) flags[args[i].slice(2)] = args[++i];
  else ids.push(args[i]);
}
if (!ids.length) {
  console.error("usage: node tools/mob.mjs <mob id|pattern>... [--zoom N] [--out DIR]");
  process.exit(1);
}
const Z = +(flags.zoom ?? 4), out = flags.out ?? join(ROOT, "records");

const explicit = !ids.some((i) => i.includes("*"));
for (const id of resolveIds(ids)) {
  const fx = await loadEffect(id);
  if (fx.meta.kind !== "mob") {
    if (explicit) console.error(`${id} is a ${fx.meta.kind ?? "effect"}, not a mob`);
    continue;
  }
  const { meta } = fx, [W, H] = meta.size, [OX, OY] = meta.origin;
  const seed = meta.options?.seed ?? 1;
  const atk = await loadMobAttack(fx.mod.mob?.attacks?.[0]?.fx);
  const optsFor = (extra) => resolveOptions(meta, { ...meta.options, seed, ...extra });
  const frame = createFrame(W, H);
  const bg = backdrop(meta.bg === "none" ? "dark" : meta.bg, W, H, OY);

  /** Draw the unit at time t with these options, then the attack effect at the same t when there is one. */
  const paint = (t, opts, attackTime = null) => {
    clearFrame(frame);
    const p = painterFor(frame);
    p.place(OX, OY);
    if (fx.mod.drawBack) fx.mod.drawBack(p, t, opts);
    fx.mod.draw(p, t, opts);
    if (atk && attackTime !== null) {
      const ao = resolveOptions(atk.meta, { ...atk.meta.options, seed });
      p.place(OX, OY, true);
      if (atk.mod.drawBack) atk.mod.drawBack(p, attackTime, ao);
      atk.mod.draw(p, attackTime, ao);
    }
  };

  const rows = [];
  rows.push(["idle", Array.from({ length: 5 }, (_, i) => {
    const t = (i * meta.duration) / 5;
    return [`idle ${t.toFixed(1)}s`, t, optsFor({}), null];
  })]);

  if (atk?.mod.attack) {
    const a = atk.mod.attack, pose = a.pose ?? { cast: "cast", windup: 0.3, hold: 0.1, recover: 0.3 };
    const hit = Math.min(...(a.hits ?? [{ t: pose.windup + pose.hold }]).map((h) => h.t));
    const beats = [pose.windup * 0.45, pose.windup * 0.95, hit, pose.windup + pose.hold, pose.windup + pose.hold + pose.recover * 0.55];
    rows.push([
      "attack",
      beats.map((t) => [
        `cast ${t.toFixed(2)}`,
        0.4,
        optsFor({ pose: "cast", cast: pose.cast, poseT: t, poseWindup: pose.windup, poseHold: pose.hold, poseRecover: pose.recover }),
        t,
      ]),
    ]);
  }

  const hurtFor = fx.mod.mob?.hurtFor ?? 0.34;
  rows.push([
    "hurt",
    [0, 0.04, 0.09, 0.16, 0.26].map((t) => [`hurt ${t.toFixed(2)}`, 0.4, optsFor({ pose: "hurt", poseT: t, poseDur: hurtFor, hurtDir: -1 }), null]),
  ]);
  const dieFor = fx.mod.mob?.dieFor ?? 0.9;
  rows.push([
    "die",
    [0, 0.18, 0.38, 0.62, 0.86].map((k) => [`die ${(k * dieFor).toFixed(2)}`, 0.4, optsFor({ pose: "die", poseT: k * dieFor, poseDur: dieFor }), null]),
  ]);

  const cols = 5, pad = 6, cellW = W * Z, cellH = H * Z + 16;
  const img = canvas(cols * cellW + (cols + 1) * pad + 40, rows.length * cellH + pad, [12, 11, 16, 255]);
  rows.forEach(([, beats], r) => {
    beats.forEach(([label, t, opts, attackTime], c) => {
      paint(t, opts, attackTime);
      const rgba = composite(frame, new Uint8ClampedArray(W * H * 4), bg);
      const X = pad + 40 + c * (cellW + pad), Y = pad + r * cellH;
      for (let y = 0; y < H * Z; y++)
        for (let x = 0; x < W * Z; x++) {
          const s = (((y / Z) | 0) * W + ((x / Z) | 0)) * 4, d = ((Y + y) * img.w + X + x) * 4;
          img.data[d] = rgba[s];
          img.data[d + 1] = rgba[s + 1];
          img.data[d + 2] = rgba[s + 2];
          img.data[d + 3] = 255;
        }
      img.text(label, X + 2, Y + H * Z + 4, 1, [180, 176, 196]);
    });
  });
  const file = join(out, id, "combat.png");
  save(file, img.png());
  console.log(`${id}  ${rows.length} rows  ->  ${file}`);
}

/** The attack module a mob points at, found by its meta name among the registered mob-attack effects. */
async function loadMobAttack(mod) {
  if (!mod?.meta?.name) return null;
  const { allIds } = await import("./lib/fxlib.mjs");
  for (const id of allIds()) {
    if (!id.startsWith("mobs/") || !id.endsWith("-attack") && !/-(slash|bolt|shot|smash|flurry)$/.test(id)) continue;
    const e = await loadEffect(id);
    if (e.mod.meta?.name === mod.meta.name) return e;
  }
  return null;
}
