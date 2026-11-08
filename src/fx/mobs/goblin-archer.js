import { hex, ease, seg } from "../../core/index.js";
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
import * as goblinArcherShot from "./goblin-archer-shot.js";

export const meta = {
  name: "Goblin Archer",
  desc: "哥布林弓箭手：皮帽红羽、独眼钩鼻，背箭囊挎短弓；拉弦半满、屏息瞄准，再松劲巡视.",
  tags: ["mob", "goblin", "fantasy", "minion", "ranged", "archer", "loop"],
  kind: "mob",
  size: [104, 108],
  origin: [52, 92],
  duration: 2.8,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: GOBLIN_PAL, seed: 3 },
};

export const mob = {
  tier: "minion",
  hp: 40,
  radius: 9,
  height: 38,
  speed: 26,
  hurtFor: 0.34,
  dieFor: 0.9,
  xp: 15,
  attacks: [{ id: "shot", name: "Shortbow shot", fx: goblinArcherShot, range: 44, windup: 0.3, cooldown: 2.2, damage: 6 }],
  loot: "pickups/coin-spin",
};

const D = meta.duration, GRID = new Grid(-52, -66, 104, 70);
const DRAW = 0.08, HOLD = 0.42, RELAX = 0.58;

function aimAt(u) {
  if (u < DRAW) return 0;
  if (u < HOLD) return ease.outCubic(seg(u, DRAW, HOLD));
  if (u < RELAX) return 1 - ease.inOutSine(seg(u, HOLD, RELAX)) * 0.85;
  return 0.15;
}

function archerMix(base, u) {
  const aim = aimAt(u);
  const scan = pulse(u, 0.68, 0.86);
  return {
    scale: 1.14,
    hands: {
      L: [6.6 - aim * 3.6 - scan * 1.2, -21.0 - aim * 2.4 - scan * 1.0],
      R: [13.4 + aim * 0.4, -22.4 - aim * 0.6],
    },
    bends: { L: 1, R: -1 },
    headX: base.headX + aim * 0.8 + scan * 0.5,
    headY: base.headY + aim * 0.4,
    look: aim > 0.25 ? 1 : scan > 0.2 ? -1 : base.look,
    earL: base.earL + aim * 1.6,
    earR: base.earR - aim * 2.4,
    knee: 0,
  };
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = goblinColors(o);
  const Pz = goblinAction(t, D, { ...o, phase: 0.36, mix: archerMix });
  const aim = aimAt(Pz.u);
  const loose = pulse(Pz.u, HOLD + 0.02, HOLD + 0.1);
  GRID.clear();
  drawGoblin(GRID, Pz, C, {
    back(g, ctx) {
      drawLoinBack(g, Pz, C);
      quiver(g, Pz, C);
    },
    body(g, ctx) {
      drawLoin(g, Pz, C);
      drawBelt(g, Pz, C);
      drawHarness(g, Pz, C, { pts: [[4.4, -29.4], [1.8, -24.8], [-1.2, -20.2], [-3.8, -16.0]] });
      vest(g, Pz, C);
    },
    front(g, ctx) {
      cap(g, Pz, C);
      bow(g, Pz, C, aim, loose);
      arrow(g, Pz, C, aim);
    },
  });
  tintHurt(GRID, o);
  GRID.draw(p, Pz.fade ?? 1);
  const fade = Pz.fade ?? 1;
  if (aim > 0.3 && fade > 0.05) {
    const [, b] = Pz.hands.L;
    p.glow(Pz.hands.R[0] + Pz.shift, b + Pz.bob + Pz.hop, 8, C.leather[5], 0.04 * fade);
  }
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), Pz = goblinAction(t, D, { ...o, phase: 0.36, mix: archerMix });
  drawShadow(p, Pz, { fade: Pz.fade ?? 1, rx: 10.2, ry: 2.3, a: 0.52 });
}

function quiver(g, Pz, C) {
  const s = Pz.scale, at = (x, y) => [Math.round((x + Pz.shift) * s), Math.round((y + Pz.bob + Pz.hop) * s)];
  const L = C.leather;
  // the tube sits on the far hip, tilted back
  const tube = [
    [-10.4, -15.0],
    [-6.8, -15.6],
    [-4.6, -26.4],
    [-8.2, -27.2],
  ];
  g.poly(tube.map(([x, y]) => at(x, y)), L[2]);
  g.poly(tube.map(([x, y]) => at(x - 0.3, y - 0.3)), L[3]);
  g.line(...at(-8.8, -26.8), ...at(-6.2, -26.2), L[0]);
  // three arrows and their red fletchings above the shoulder
  for (const [x, y] of [[-9.2, -29.4], [-7.6, -30.2], [-6.4, -29.6]]) {
    g.line(...at(x + 0.6, y + 2.4), ...at(x + 1.4, -25.0), C.wood[4]);
    g.set(...at(x, y), C.red[3]);
    g.set(...at(x + 1.2, y), C.red[3]);
    g.set(...at(x + 0.6, y - 0.8), C.red[4]);
    g.set(...at(x + 0.6, y + 1.6), C.red[2]);
  }
  g.line(...at(-9.6, -28.2), ...at(-6.4, -29.0), L[1]);
}

function vest(g, Pz, C) {
  const L = C.leather;
  const pts = [
    [-4.4, -29.6],
    [4.2, -29.6],
    [5.0, -26.0],
    [2.4, -24.2],
    [-1.6, -24.8],
    [-4.6, -26.4],
  ];
  g.poly(pts.map(([x, y]) => at(Pz, x, y)), L[2]);
  g.poly(
    [[-4.0, -29.2], [1.6, -29.2], [1.0, -26.0], [-2.0, -25.6], [-4.2, -26.6]].map(([x, y]) => at(Pz, x, y)),
    L[3],
  );
  g.line(...at(Pz, -3.4, -28.8), ...at(Pz, 2.0, -28.6), L[4]);
  g.set(...at(Pz, 1.4, -25.0), C.metal[4]);
  // bracer on the bow arm
  for (let i = 0; i < 3; i++) g.line(...at(Pz, 10.0 + i * 0.4, -21.4 - i * 1.2), ...at(Pz, 11.4 + i * 0.4, -21.0 - i * 1.2), L[3]);
}

function cap(g, Pz, C) {
  const L = C.leather, hx = Pz.headX, hy = Pz.headY;
  const pts = [
    [-4.8 + hx, -38.6 + hy],
    [-2.4 + hx, -40.6 + hy],
    [2.8 + hx, -40.2 + hy],
    [6.4 + hx, -38.2 + hy],
    [5.4 + hx, -36.4 + hy],
    [0.4 + hx, -37.4 + hy],
    [-4.2 + hx, -37.0 + hy],
  ];
  g.poly(pts.map(([x, y]) => at(Pz, x, y)), L[2]);
  g.poly(
    [[-4.0 + hx, -38.0 + hy], [-2.2 + hx, -39.8 + hy], [2.4 + hx, -39.4 + hy], [5.0 + hx, -38.0 + hy], [1.0 + hx, -37.6 + hy], [-3.4 + hx, -37.4 + hy]].map(([x, y]) => at(Pz, x, y)),
    L[3],
  );
  g.line(...at(Pz, -4.4 + hx, -37.2 + hy), ...at(Pz, 5.4 + hx, -36.6 + hy), L[1]);
  g.line(...at(Pz, -3.0 + hx, -39.6 + hy), ...at(Pz, 3.4 + hx, -39.2 + hy), L[4]);
  // red feather at the back
  g.line(...at(Pz, -4.0 + hx, -38.6 + hy), ...at(Pz, -7.6 + hx, -42.6 + hy), C.red[2]);
  g.line(...at(Pz, -3.6 + hx, -38.4 + hy), ...at(Pz, -7.0 + hx, -42.2 + hy), C.red[3]);
  g.set(...at(Pz, -7.8 + hx, -43.0 + hy), C.red[4]);
}

function bow(g, Pz, C, aim, loose) {
  const W = C.wood, L = C.leather;
  const ln = (a, b, col) => g.line(...at(Pz, ...a), ...at(Pz, ...b), col);
  const curve = [[14.6, -31.8], [16.2, -27.4], [14.8, -22.4], [16.2, -17.4], [14.6, -12.8]];
  for (let i = 1; i < curve.length; i++) {
    ln([curve[i - 1][0] - 0.5, curve[i - 1][1]], [curve[i][0] - 0.5, curve[i][1]], W[2]);
    ln(curve[i - 1], curve[i], W[3]);
    ln([curve[i - 1][0] + 0.6, curve[i - 1][1]], [curve[i][0] + 0.6, curve[i][1]], W[5]);
  }
  g.set(...at(Pz, 14.4, -32.0), W[3]);
  g.set(...at(Pz, 14.4, -12.6), W[3]);
  // leather grip and a sinew string pulled to the draw hand
  ln([14.8, -24.2], [14.8, -20.6], L[3]);
  ln([15.4, -24.2], [15.4, -20.6], L[4]);
  const pull = [Pz.hands.L[0] + 0.8, Pz.hands.L[1]];
  const sx = aim > 0.02 ? pull[0] : 15.0;
  const sy = aim > 0.02 ? pull[1] : -22.2;
  ln([14.8, -31.6], [sx, sy], hex("#d8c8a0"));
  ln([sx, sy], [14.8, -13.0], hex("#d8c8a0"));
  if (loose > 0.1) ln([15.0, -22.2], [15.0 + loose * 2.4, -22.2], hex("#f0e4c0"));
  // knuckles over the grip
  g.set(...at(Pz, 14.0, -22.6), C.skin[5]);
  g.set(...at(Pz, 14.8, -22.2), C.skin[4]);
}

function arrow(g, Pz, C, aim) {
  if (aim < 0.08) return;
  const W = C.wood, M = C.metal;
  const [dx, dy] = Pz.hands.L;
  const x0 = dx + 0.6, y0 = dy - 0.2;
  g.line(...at(Pz, x0, y0), ...at(Pz, 15.2, -22.4), W[4]);
  g.set(...at(Pz, 15.4, -22.4), M[5]);
  g.set(...at(Pz, 15.8, -22.4), M[4]);
  // fletching at the nock
  g.set(...at(Pz, x0 + 0.4, y0 - 0.8), C.red[3]);
  g.set(...at(Pz, x0 + 1.0, y0 - 1.4), C.red[3]);
  g.set(...at(Pz, x0 + 0.6, y0 + 0.4), C.red[2]);
}

function at(Pz, x, y) {
  const s = Pz.scale;
  return [Math.round((x + Pz.shift) * s), Math.round((y + Pz.bob + Pz.hop) * s)];
}
