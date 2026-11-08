import { hex } from "../../core/index.js";
import { Grid, shift } from "./_lib.js";
import {
  GOBLIN_PAL,
  goblinColors,
  goblinAction,
  tintHurt,
  drawGoblin,
  drawLoinBack,
  drawLoin,
  drawBelt,
  drawHarness,
  drawShadow,
  pulse,
} from "./_goblin.js";
import * as goblinAgileFlurry from "./goblin-agile-flurry.js";

export const meta = {
  name: "Goblin Agile",
  desc: "敏捷哥布林：精瘦低伏的小哥布林，红布头带与腕踝绑带；踩着碎步连跳佯攻，双匕在胸前交错闪寒光.",
  tags: ["mob", "goblin", "fantasy", "minion", "assassin", "agile", "loop"],
  kind: "mob",
  size: [88, 104],
  origin: [44, 88],
  duration: 2,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: GOBLIN_PAL, seed: 5 },
};

export const mob = {
  tier: "minion",
  hp: 32,
  radius: 8,
  height: 34,
  speed: 38,
  hurtFor: 0.34,
  dieFor: 0.9,
  xp: 16,
  attacks: [{ id: "flurry", name: "Twin fang flurry", fx: goblinAgileFlurry, range: 26, windup: 0.16, cooldown: 1.8, damage: 9 }],
  loot: "pickups/coin-spin",
};

const D = meta.duration, GRID = new Grid(-44, -62, 88, 66);
const HOPS = [0.1, 0.36, 0.6, 0.84];

function hopAt(u) {
  let h = 0;
  for (const a of HOPS) {
    const p = pulse(u, a, a + 0.1);
    if (p > h) h = p;
  }
  return h;
}

function agileMix(base, u, ph) {
  const hop = hopAt(u);
  const feint = pulse(u, 0.46, 0.6);
  const weave = Math.sin(ph * 3 + 0.8);
  return {
    scale: 0.98,
    lean: 0.8,
    hop: -hop * 3.2,
    shift: base.shift + feint * 2.4 - hop * 0.3,
    bob: base.bob - 0.8 + hop * 0.4,
    headX: base.headX + weave * 0.7 + feint * 0.6,
    headY: base.headY - hop * 0.35,
    hands: {
      L: [-6.8 + feint * 2.4, -18.8 - hop * 0.6 - feint * 1.0],
      R: [9.2 + feint * 2.0, -19.2 - hop * 0.6 - feint * 0.6],
    },
    bends: { L: 1, R: -1 },
    earL: base.earL + hop * 2.4 + weave * 0.8,
    earR: base.earR + hop * 1.6,
    look: feint > 0.3 ? 1 : weave > 0.4 ? 1 : weave < -0.5 ? -1 : base.look,
    grin: Math.max(base.grin, feint),
  };
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = goblinColors(o);
  const Pz = goblinAction(t, D, { ...o, phase: 0.8, mix: agileMix });
  const hop = hopAt(Pz.u);
  const feint = pulse(Pz.u, 0.46, 0.6);
  const flash = feint > 0.45 || pulse(Pz.u, 0.62, 0.72) > 0.5;
  GRID.clear();
  drawGoblin(GRID, Pz, C, {
    back(g, ctx) {
      drawLoinBack(g, Pz, C);
    },
    body(g, ctx) {
      drawLoin(g, Pz, C);
      drawBelt(g, Pz, C);
      drawHarness(g, Pz, C, { pts: [[4.6, -28.6], [2.2, -24.2], [-0.8, -19.6], [-3.4, -15.2]] });
      wraps(g, Pz, C);
    },
    front(g, ctx) {
      headband(g, Pz, C);
      dagger(g, Pz, C, Pz.hands.R, -0.92 + feint * 0.7, flash);
      dagger(g, Pz, C, Pz.hands.L, -0.52 + feint * 0.42, flash);
    },
  });
  tintHurt(GRID, o);
  GRID.draw(p, Pz.fade ?? 1);
  const fade = Pz.fade ?? 1;
  if (flash && fade > 0.05) {
    p.glow(Pz.hands.R[0] + Pz.shift, Pz.hands.R[1] + Pz.bob + Pz.hop, 5, hex("#c8f4ff"), 0.25 * fade);
    if (fade > 0.5) p.dot(Pz.hands.R[0] + Pz.shift + 2, Pz.hands.R[1] + Pz.bob + Pz.hop - 1, hex("#eaffff"));
  }
  if (fade > 0.05) p.glow(Pz.shift * 0.4, -24 - hop * 3, 14, C.skin[5], 0.05 * fade);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), Pz = goblinAction(t, D, { ...o, phase: 0.8, mix: agileMix });
  const hop = hopAt(Pz.u);
  drawShadow(p, Pz, { fade: Pz.fade ?? 1, rx: 8.2 - hop * 1.2, ry: 1.8 - hop * 0.2, a: 0.44 + hop * 0.06 });
}

function headband(g, Pz, C) {
  const R = C.red;
  const hx = Pz.headX, hy = Pz.headY;
  const pts = [[-4.4, -35.4], [-0.8, -38.0], [3.6, -37.4], [6.0, -35.4]].map(([x, y]) => at(Pz, x + hx, y + hy));
  for (let i = 1; i < pts.length; i++) {
    g.line(...pts[i - 1], ...pts[i], R[2]);
    g.line(pts[i - 1][0], pts[i - 1][1] - 1, pts[i][0], pts[i][1] - 1, R[3]);
  }
  // knot and two tails flicking back
  const tail = Math.sin(Pz.ph * 3) * 1.6;
  g.rect(...at(Pz, -5.2 + hx, -37.0 + hy), Math.max(1, Math.round(Pz.scale * 1.6)), Math.max(1, Math.round(Pz.scale * 1.6)), R[3]);
  g.line(...at(Pz, -5.2 + hx, -36.6 + hy), ...at(Pz, -9.5 + hx, -34.4 + hy + tail), R[2]);
  g.set(...at(Pz, -9.5 + hx, -34.0 + hy + tail), R[3]);
  g.line(...at(Pz, -5.0 + hx, -36.2 + hy), ...at(Pz, -8.6 + hx, -32.2 + hy - tail), R[1]);
  g.set(...at(Pz, -8.6 + hx, -31.8 + hy - tail), R[2]);

}

function dagger(g, Pz, C, hand, angle, flash) {
  const [hx, hy] = hand;
  const dx = Math.cos(angle), dy = Math.sin(angle);
  const px = -dy, py = dx;
  const M = C.metal;
  const [gx, gy] = at(Pz, hx - dx * 0.6, hy - dy * 0.6);
  // grip and a small guard
  g.line(gx, gy, ...at(Pz, hx - dx * 3.2, hy - dy * 3.2), C.leather[2]);
  g.line(...at(Pz, hx + px * 1.7, hy + py * 1.7), ...at(Pz, hx - px * 1.7, hy - py * 1.7), M[3]);
  g.set(...at(Pz, hx + px * 1.7, hy + py * 1.7), M[5]);
  // blade: a 3 px base tapering to a point, lit on the top edge, dark spine below
  const L = 6.8;
  for (let t = 0.4; t <= L; t += 0.5) {
    const k = 1 - t / L;
    const w = 0.4 + k * 1.35;
    const x = hx + dx * t, y = hy + dy * t;
    for (let q = -w; q <= w + 0.01; q += 0.5) {
      const c = q < -w + 0.8 ? M[2] : q > w - 0.8 ? (flash ? M[6] : M[5]) : M[4];
      g.set(...at(Pz, x + px * q, y + py * q), c);
    }
  }
  g.set(...at(Pz, hx + dx * (L + 0.5), hy + dy * (L + 0.5)), flash ? M[6] : M[5]);
  // knuckles over the grip
  g.set(...at(Pz, hx, hy), C.skin[5]);
  g.set(...at(Pz, hx - dx * 0.8 + px * 0.6, hy - dy * 0.8 + py * 0.6), C.skin[4]);
}

function wraps(g, Pz, C) {
  const R = C.red;
  for (const y of [-3.4, -2.4]) {
    g.line(...at(Pz, -7.4, y), ...at(Pz, -4.6, y + 0.2), R[2]);
    g.line(...at(Pz, 4.4, y), ...at(Pz, 7.4, y + 0.2), R[2]);
  }
  // wrist bands, following the forearm back toward the shoulder
  for (const [side, hand] of [[1, Pz.hands.R], [-1, Pz.hands.L]]) {
    const sx = side * 6.8, sy = -28.4;
    const bx = hand[0] + (sx - hand[0]) * 0.12, by = hand[1] + (sy - hand[1]) * 0.12;
    const px = -(sy - hand[1]), py = sx - hand[0];
    const n = Math.hypot(px, py) || 1;
    g.line(...at(Pz, bx + (px / n) * 1.1, by + (py / n) * 1.1), ...at(Pz, bx - (px / n) * 1.1, by - (py / n) * 1.1), R[3]);
    g.line(...at(Pz, bx + (px / n) * 1.1, by + (py / n) * 1.1 + 0.8), ...at(Pz, bx - (px / n) * 1.1, by - (py / n) * 1.1 + 0.8), R[2]);
  }
}

function at(Pz, x, y) {
  const s = Pz.scale;
  return [Math.round((x + Pz.shift) * s), Math.round((y + Pz.bob + Pz.hop) * s)];
}
