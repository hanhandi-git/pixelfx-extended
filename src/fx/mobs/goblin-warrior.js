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
import * as goblinWarriorSlash from "./goblin-warrior-slash.js";

export const meta = {
  name: "Goblin Warrior",
  desc: "哥布林战士：驼背宽颚、钩鼻独眼，红腰布束皮甲；圆木盾护身，锈剑在身前画圈虚刺.",
  tags: ["mob", "goblin", "fantasy", "minion", "melee", "warrior", "loop"],
  kind: "mob",
  size: [96, 108],
  origin: [48, 92],
  duration: 2.8,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: GOBLIN_PAL, seed: 1 },
};

export const mob = {
  tier: "minion",
  hp: 48,
  radius: 10,
  height: 38,
  speed: 22,
  hurtFor: 0.34,
  dieFor: 0.9,
  xp: 14,
  attacks: [{ id: "cleave", name: "Rusty cleave", fx: goblinWarriorSlash, range: 28, windup: 0.26, cooldown: 2.4, damage: 8 }],
  loot: "pickups/coin-spin",
};

const D = meta.duration, GRID = new Grid(-48, -64, 96, 68);
const INKISH = hex("#10131a");

function warriorMix(base, u) {
  const feint = pulse(u, 0.34, 0.5);
  const guard = pulse(u, 0.62, 0.72);
  return {
    scale: 1.12,
    hands: {
      L: [-9.6 - guard * 0.7, -19.4 + base.bob * 0.15],
      R: [11.4 + feint * 2.2 + guard * 0.4, -19.4 - feint * 0.4 + base.bob * 0.15],
    },
    bends: { L: 1, R: -1 },
    headX: base.headX + feint * 0.5,
    headY: base.headY - feint * 0.3,
    earL: base.earL + feint * 1.2,
  };
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = goblinColors(o);
  const Pz = goblinAction(t, D, { ...o, phase: 0.05, mix: warriorMix });
  const feint = pulse(Pz.u, 0.34, 0.5);
  const guard = pulse(Pz.u, 0.62, 0.72);
  GRID.clear();
  drawGoblin(GRID, Pz, C, {
    back(g, ctx) {
      drawLoinBack(g, Pz, C);
      shield(g, Pz, C);
    },
    body(g, ctx) {
      drawLoin(g, Pz, C);
      drawBelt(g, Pz, C);
      drawHarness(g, Pz, C);
    },
    front(g, ctx) {
      sword(g, Pz, C, feint, guard);
      warPaint(g, Pz, C);
    },
  });
  tintHurt(GRID, o);
  GRID.draw(p, Pz.fade ?? 1);
  const fade = Pz.fade ?? 1;
  if (feint > 0.1 && fade > 0.05) {
    const tip = bladeTip(Pz, feint);
    p.glow(tip[0], tip[1], 3, hex("#fff6d8"), 0.2 * feint * fade);
    if (fade > 0.5) p.dot(Math.round(tip[0]), Math.round(tip[1]), hex("#fffbe8"));
  }
  if (fade > 0.05) p.glow(-10, -20, 12, C.metal[4], (0.035 + feint * 0.02) * fade);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), Pz = goblinAction(t, D, { ...o, phase: 0.05, mix: warriorMix });
  drawShadow(p, Pz, { fade: Pz.fade ?? 1, rx: 10.4, ry: 2.4, a: 0.55 });
}

function bladeDir(Pz, feint) {
  const a = -1.12 + feint * 0.36;
  return [Math.cos(a), Math.sin(a)];
}

function bladeTip(Pz, feint) {
  const h = Pz.hands.R, [dx, dy] = bladeDir(Pz, feint), L = 13;
  return [h[0] + dx * L, h[1] + dy * L];
}

function sword(g, Pz, C, feint, guard) {
  const s = Pz.scale, at = (x, y) => [Math.round((x + Pz.shift) * s), Math.round((y + Pz.bob + Pz.hop) * s)];
  const [hx, hy] = Pz.hands.R;
  const [dx, dy] = bladeDir(Pz, feint);
  const px = -dy, py = dx;
  const M = C.metal, W = C.leather;
  const L = 13;
  // grip and pommel behind the fist
  const gx = hx - dx * 3.4, gy = hy - dy * 3.4;
  g.line(...at(hx, hy), ...at(gx, gy), W[2]);
  g.line(...at(hx + px * 0.5, hy + py * 0.5), ...at(gx + px * 0.5, gy + py * 0.5), W[4]);
  g.set(...at(gx - px * 0.4, gy - py * 0.4), M[4]);
  // crossguard: a hard bar across the base of the blade
  for (let k = -2.6; k <= 2.6; k += 0.5) g.set(...at(hx + px * k - dx * 0.6, hy + py * k - dy * 0.6), k < 0 ? M[3] : M[5]);
  // blade: a dark edge, a lit face, a bright top edge, chipped at the tip
  for (let t = 1; t <= L; t += 0.5) {
    const bx = hx + dx * t, byy = hy + dy * t;
    g.set(...at(bx + px * 2.0, byy + py * 2.0), INKISH);
    for (let q = -1.4; q <= 1.4; q += 0.7) {
      g.set(...at(bx + px * q, byy + py * q), q < -0.7 ? M[2] : q > 0.7 ? (t > L - 2.5 ? M[4] : M[6]) : M[4]);
    }
  }
  g.set(...at(hx + px * 2.4, hy + py * 2.4), INKISH);
  const [tx, ty] = at(hx + dx * L, hy + dy * L);
  g.set(tx, ty, M[6]);
  g.set(tx - Math.round(px), ty - Math.round(py), M[2]);
  // rust pits and a nicked edge
  g.set(...at(hx + dx * 4.5 + px * 0.6, hy + dy * 4.5 + py * 0.6), C.rust[3]);
  g.set(...at(hx + dx * 8.2 + px * 0.6, hy + dy * 8.2 + py * 0.6), C.rust[2]);
  // knuckles back over the grip
  g.set(...at(hx, hy), C.skin[5]);
  g.set(...at(hx + px, hy + py), C.skin[4]);
  if (guard > 0.2) g.set(...at(hx + px * 2.4, hy + py * 2.4), M[6]);
}

function shield(g, Pz, C) {
  const s = Pz.scale, sh = Pz.shift, by = Pz.bob + Pz.hop;
  const cx = -12.0, cy = -20.0 + Pz.bob * 0.15, rx = 7.4, ry = 8.4;
  const M = C.metal, W = C.wood;
  const X = (x) => (x + sh) * s, Y = (y) => (y + by) * s;
  const box = [Math.floor(X(cx - rx)), Math.floor(Y(cy - ry)), Math.ceil(X(cx + rx)), Math.ceil(Y(cy + ry))];
  for (let py = box[1]; py <= box[3]; py++)
    for (let px = box[0]; px <= box[2]; px++) {
      const ux = px / s - sh, uy = py / s - by;
      const nx = (ux - cx) / rx, ny = (uy - cy) / ry, d = Math.hypot(nx, ny);
      if (d > 1) continue;
      const lit = Math.hypot((nx + 0.55) / 1.2, (ny + 0.6) / 1.2) < 0.92;
      let c;
      if (d > 0.92) c = lit ? M[5] : M[2];
      else if (d > 0.84) c = lit ? M[4] : M[2];
      else {
        // wooden face: three planks, darker at the rim, a lit top-left
        const plank = ux < cx - 2.4 ? (lit ? W[4] : W[3]) : ux > cx + 2.4 ? (lit ? W[3] : W[2]) : lit ? W[4] : W[3];
        c = plank;
        if (Math.abs(ux - (cx - 2.4)) < 0.6 || Math.abs(ux - (cx + 2.4)) < 0.6) c = W[1];
      }
      g.set(px, py, c);
    }
  // rim studs, central iron boss and its highlight
  const boss = (x, y, r, col, ring) => {
    for (let yy = Math.floor(Y(y - r)); yy <= Math.ceil(Y(y + r)); yy++)
      for (let xx = Math.floor(X(x - r)); xx <= Math.ceil(X(x + r)); xx++) {
        const nx = (xx / s - sh - x) / r, ny = (yy / s - by - y) / r, d = Math.hypot(nx, ny);
        if (d > 1) continue;
        g.set(xx, yy, d > 0.82 ? ring : d < 0.45 ? col[5] : col[3]);
      }
  };
  boss(cx, cy, 3.1, M, M[1]);
  for (const [sx, sy] of [[-5.2, -4.6], [5.0, -4.2], [-5.0, 4.4], [4.8, 4.8]]) g.set(...[Math.round(X(cx + sx)), Math.round(Y(cy + sy))], M[5]);
  // a bite out of the rim
  for (let i = 0; i < 4; i++) g.set(Math.round(X(cx + rx - 0.6) + i), Math.round(Y(cy - 2.4) - i), 0);
}

function warPaint(g, Pz, C) {
  const s = Pz.scale, at = (x, y) => [Math.round((x + Pz.shift) * s), Math.round((y + Pz.bob + Pz.hop) * s)];
  const [ax, ay] = at(1.6 + Pz.headX, -30.6 + Pz.headY);
  g.line(ax, ay, ax + Math.round(3.2 * s), ay + Math.round(0.6 * s), C.red[3]);
  g.set(ax, ay + Math.max(1, Math.round(s)), C.red[2]);
  g.set(ax + Math.max(1, Math.round(s)), ay + Math.max(1, Math.round(s)), C.red[3]);
}
