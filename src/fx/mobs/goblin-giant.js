import { fit, hex, rng, P } from "../../core/index.js";
import { Grid, shift, Swarm, spring } from "./_lib.js";
import {
  GOBLIN_PAL,
  goblinColors,
  goblinAction,
  tintHurt,
  drawGoblin,
  drawLoinBack,
  drawLoin,
  drawBelt,
  drawShadow,
  pulse,
} from "./_goblin.js";
import * as goblinGiantSmash from "./goblin-giant-smash.js";

export const meta = {
  name: "Goblin Giant",
  desc: "巨人哥布林：两倍体格的驼背哥布林，铁肩甲骨项链、腰缠铁扣；巨棒扛肩，跺脚震起一圈尘土.",
  tags: ["mob", "goblin", "fantasy", "minion", "brute", "giant", "loop"],
  kind: "mob",
  size: [120, 128],
  origin: [60, 110],
  duration: 3.4,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: GOBLIN_PAL, seed: 4 },
};

export const mob = {
  tier: "elite",
  hp: 120,
  radius: 15,
  height: 58,
  speed: 14,
  hurtFor: 0.34,
  dieFor: 0.9,
  xp: 35,
  attacks: [{ id: "quake", name: "Ground quake", fx: goblinGiantSmash, range: 34, windup: 0.62, cooldown: 3.6, damage: 22 }],
  loot: "pickups/loot-beam",
};

const D = meta.duration, GRID = new Grid(-60, -80, 120, 84), SWARM = new Swarm();
const DUST = hex("#8a7f72"), STOMP = 0.64;
const GIANT_EYE = ["#220806", "#6a140e", "#c83018", "#ffb050"];

function stompAt(u) {
  return u >= STOMP && u < STOMP + 0.1 ? Math.sin(Math.PI * ((u - STOMP) / 0.1)) : 0;
}

function giantMix(base, u) {
  const prep = pulse(u, STOMP - 0.12, STOMP);
  const hit = u >= STOMP ? spring((u - STOMP) * D, 1.4, 4.2) : 0;
  return {
    scale: 1.5,
    armLen: 1.12,
    lean: 0,
    hop: 0,
    bob: base.bob * 1.3 + prep * 1.5 - Math.max(0, hit) * 2.2,
    squash: base.squash + prep * 0.05 - Math.max(0, hit) * 0.05,
    lift: { L: 0, R: prep * 4.2 },
    hands: {
      L: [-9.6, -18.6 + base.bob * 0.3],
      R: [13.0, -19.4 + base.bob * 0.25],
    },
    bends: { L: 1, R: -1 },
    earL: base.earL * 1.4,
    earR: base.earR * 1.4,
    look: u > 0.4 && u < 0.58 ? 1 : base.look,
  };
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = goblinColors(o);
  C.eye = fit(GIANT_EYE, 4);
  const Pz = goblinAction(t, D, { ...o, phase: 0.05, mix: giantMix });
  const stomp = stompAt(Pz.u);
  GRID.clear();
  drawGoblin(GRID, Pz, C, {
    back(g, ctx) {
      drawLoinBack(g, Pz, C);
    },
    body(g, ctx) {
      drawLoin(g, Pz, C);
      drawBelt(g, Pz, C);
      necklace(g, Pz, C);
    },
    front(g, ctx) {
      pauldron(g, Pz, C);
      club(g, Pz, C);
      tusk(g, Pz, C);
    },
  });
  tintHurt(GRID, o);
  GRID.draw(p, Pz.fade ?? 1);
  const fade = Pz.fade ?? 1;
  if (stomp > 0.05 && fade > 0.05) {
    const sw = SWARM.begin(t);
    for (let i = 0; i < 16; i++) {
      const r = rng(o.seed, i, 77);
      const age = (Pz.u - STOMP) * D + r.range(0, 0.05);
      sw.add(P.SMOKE, r.range(-10, 12), 0.4, r.range(-28, 28), r.range(-14, 4), age, 0.5 + r.range(0, 0.25), DUST, 2.4 + r.range(0, 2), 3);
    }
    sw.draw(p);
    p.glow(0, 0, 30, C.eye[3], (0.06 + stomp * 0.1) * fade);
  }
  if (fade > 0.05) p.glow(0, -34, 34, C.skin[4], 0.045 * fade);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), Pz = goblinAction(t, D, { ...o, phase: 0.05, mix: giantMix });
  const stomp = stompAt(Pz.u);
  drawShadow(p, Pz, { fade: Pz.fade ?? 1, rx: 15.4, ry: 3.4, a: 0.62 + stomp * 0.08 });
}

function club(g, Pz, C) {
  const W = C.wood, M = C.metal, L = C.leather;
  const s = Pz.scale;
  const [hx, hy] = Pz.hands.R;
  const tip = [15.4, -36.0], head = [15.8, -39.4];
  // solid shaft with one lit edge and one shadow edge
  const A = at(Pz, hx, hy), B = at(Pz, ...tip);
  g.tube([A, B], 1.6 * s, W[3]);
  const dx = B[0] - A[0], dy = B[1] - A[1], n = Math.hypot(dx, dy) || 1;
  const px = (-dy / n) * 1.3 * s, py = (dx / n) * 1.3 * s;
  g.line(A[0] + px, A[1] + py, B[0] + px, B[1] + py, W[4]);
  g.line(A[0] - px, A[1] - py, B[0] - px, B[1] - py, W[1]);
  // leather grip wraps near the fist, iron band up the shaft
  for (let i = 0; i < 3; i++) g.line(...at(Pz, hx - 1.3, hy - 1.2 - i * 1.4), ...at(Pz, hx + 1.5, hy - 1.6 - i * 1.4), L[3]);
  g.line(...at(Pz, 13.8, -27.0), ...at(Pz, 14.8, -27.4), M[3]);
  g.set(...at(Pz, 14.4, -27.2), M[5]);
  // knotty head: a fat gnarled bulb, not a ball
  const X = (x) => (x + Pz.shift) * s, Y = (y) => (y + Pz.bob + Pz.hop) * s;
  for (let py = Math.floor(Y(head[1] - 6.2)); py <= Math.ceil(Y(head[1] + 5.4)); py++)
    for (let px = Math.floor(X(head[0] - 5.0)); px <= Math.ceil(X(head[0] + 5.0)); px++) {
      const ux = px / s - Pz.shift, uy = py / s - Pz.bob - Pz.hop;
      const nx = (ux - head[0]) / 5.0, ny = (uy - head[1]) / 5.8;
      const wob = 1 + 0.05 * Math.sin(uy * 2.4) - 0.04 * Math.sin(ux * 3.1);
      if (nx * nx + ny * ny > wob) continue;
      let c = nx + ny < -0.55 ? W[5] : nx + ny > 0.5 ? W[2] : W[3];
      if (nx > 0.6) c = W[2];
      if (ny < -0.7 && nx < 0.4) c = W[5];
      if (Math.hypot(ux - head[0] + 1.2, uy - head[1] - 0.4) < 1.0) c = W[1];
      if (Math.abs(ux - head[0] + 2.4) < 0.5 && uy > head[1] - 1.4 && uy < head[1] + 2.2) c = W[2];
      g.set(px, py, c);
    }
  // taper from the shaft into the head
  g.tube([at(Pz, 15.2, -35.2), at(Pz, 15.6, -37.4)], 2.4 * s, W[2]);
  g.tube([at(Pz, 15.1, -35.6), at(Pz, 15.4, -37.0)], 1.6 * s, W[3]);
  // iron studs and a bark crack
  for (const [sx, sy] of [[-2.8, -2.2], [2.0, -3.0], [3.2, 1.2], [-1.4, 3.0]]) {
    g.set(...at(Pz, head[0] + sx, head[1] + sy), M[4]);
    g.set(...at(Pz, head[0] + sx + 0.7, head[1] + sy + 0.7), M[2]);
  }
  g.line(...at(Pz, head[0] - 3.6, head[1] - 4.0), ...at(Pz, head[0] + 1.8, head[1] - 4.8), W[1]);
  g.line(...at(Pz, head[0] + 3.4, head[1] - 1.0), ...at(Pz, head[0] + 2.4, head[1] + 2.4), W[1]);
  // knuckles over the shaft
  g.set(...at(Pz, hx, hy), C.skin[5]);
  g.set(...at(Pz, hx + 1.2, hy - 0.6), C.skin[4]);
}

function pauldron(g, Pz, C) {
  const M = C.metal;
  const cx = -6.8, cy = -27.0, rx = 4.6, ry = 3.2;
  const shell = (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
  const s = Pz.scale, sh = Pz.shift, by = Pz.bob + Pz.hop;
  for (let py = Math.floor((-31 + by) * s); py <= Math.ceil((-23 + by) * s); py++)
    for (let px = Math.floor((-12 + sh) * s); px <= Math.ceil((-2 + sh) * s); px++) {
      const ux = px / s - sh, uy = py / s - by;
      if (!shell(ux, uy)) continue;
      const ny = (uy - cy) / ry, nx = (ux - cx) / rx;
      let c = nx + ny < -0.5 ? M[5] : nx + ny > 0.6 ? M[2] : M[3];
      if (!shell(ux, uy + 1)) c = M[1];
      g.set(px, py, c);
    }
  // two short spikes on the outer arm
  for (const [sx, sy, dx, dy] of [[-9.6, -28.6, -1.8, -2.0], [-10.8, -27.0, -2.2, -1.2]]) {
    g.line(...at(Pz, sx, sy), ...at(Pz, sx + dx, sy + dy), M[3]);
    g.set(...at(Pz, sx + dx, sy + dy), M[6]);
    g.set(...at(Pz, sx, sy), M[1]);
  }
  for (const [sx, sy] of [[-8.2, -27.2], [-5.4, -27.4]]) g.set(...at(Pz, sx, sy), M[2]);
}

function necklace(g, Pz, C) {
  const B = C.bone;
  const pts = [[-5.2, -28.4], [-2.8, -26.2], [0.2, -25.4], [3.2, -26.0], [5.6, -27.8]];
  for (let i = 1; i < pts.length; i++) g.line(...at(Pz, ...pts[i - 1]), ...at(Pz, ...pts[i]), C.leather[2]);
  for (const [x, y, z] of [[-3.4, -25.8, 2], [0.2, -24.8, 3], [3.6, -25.6, 2]]) {
    g.set(...at(Pz, x, y), B[5]);
    g.set(...at(Pz, x + z * 0.5, y + 0.6), B[4]);
    g.set(...at(Pz, x - z * 0.5, y + 0.6), B[3]);
  }
}

function tusk(g, Pz, C) {
  // a second, bigger broken tusk on the underbite
  const hx = Pz.headX, hy = Pz.headY;
  g.line(...at(Pz, 4.2 + hx, -26.4 + hy), ...at(Pz, 4.6 + hx, -28.8 + hy), C.bone[5]);
  g.line(...at(Pz, 4.8 + hx, -27.2 + hy), ...at(Pz, 5.0 + hx, -28.4 + hy), C.bone[4]);
  g.set(...at(Pz, 4.6 + hx, -29.0 + hy), C.bone[2]);
}

function at(Pz, x, y) {
  const s = Pz.scale;
  return [Math.round((x + Pz.shift) * s), Math.round((y + Pz.bob + Pz.hop) * s)];
}
