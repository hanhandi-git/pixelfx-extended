import { fit, TAU } from "../../core/index.js";
import { Grid, shift } from "./_lib.js";
import {
  GOBLIN_PAL,
  ARCANE,
  goblinColors,
  goblinAction,
  tintHurt,
  drawGoblin,
  drawShadow,
  pulse,
} from "./_goblin.js";
import * as goblinMageBolt from "./goblin-mage-bolt.js";

export const meta = {
  name: "Goblin Mage",
  desc: "哥布林法师：紫袍尖帽裹着驼背绿皮，独眼泛着紫光；木杖叉尖托着漂浮的奥术球与环绕符文.",
  tags: ["mob", "goblin", "fantasy", "minion", "caster", "mage", "loop"],
  kind: "mob",
  size: [96, 112],
  origin: [48, 96],
  duration: 3,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: GOBLIN_PAL, seed: 2 },
};

export const mob = {
  tier: "minion",
  hp: 36,
  radius: 9,
  height: 40,
  speed: 18,
  hurtFor: 0.34,
  dieFor: 0.9,
  xp: 18,
  attacks: [{ id: "bolt", name: "Arcane bolt", fx: goblinMageBolt, range: 40, windup: 0.5, cooldown: 2.8, damage: 7 }],
  loot: "pickups/gem-spin",
};

const D = meta.duration, GRID = new Grid(-48, -70, 96, 74);
const ORB = [11.8, -44.2], MAGE_EYE = fit(ARCANE, 4);

function chantAt(u) {
  return pulse(u, 0.2, 0.42) + pulse(u, 0.66, 0.84) * 0.8;
}

function mageMix(base, u, ph) {
  const chant = chantAt(u);
  return {
    scale: 1.12,
    hop: -3.2 - chant * 0.8 + Math.sin(ph * 2) * 0.25,
    headY: base.headY - 0.3 - chant * 0.6,
    headX: base.headX + chant * 0.3,
    earL: base.earL + chant * 2.6,
    earR: base.earR - chant * 2.0,
    hands: {
      L: [6.4 + chant * 0.8, -23.6 - chant * 1.6],
      R: [11.0, -19.6 + base.bob * 0.1],
    },
    bends: { L: -1, R: -1 },
    look: chant > 0.25 ? 1 : base.look,
  };
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = goblinColors(o);
  C.eye = MAGE_EYE;
  const Pz = goblinAction(t, D, { ...o, phase: 0.12, mix: mageMix });
  const chant = chantAt(Pz.u);
  const sway = Math.sin(Pz.ph * 2 + 0.6) * 1.4 + chant * 0.8;
  GRID.clear();
  drawGoblin(GRID, Pz, C, {
    back(g, ctx) {
      robeBack(g, Pz, C, sway);
    },
    body(g, ctx) {
      robe(g, Pz, C, sway);
      mantle(g, Pz, C);
      sash(g, Pz, C);
      charm(g, Pz, C);
    },
    front(g, ctx) {
      hat(g, Pz, C);
      staff(g, Pz, C);
      orb(g, Pz, C, chant);
      motes(p, Pz, C, chant, Pz.fade ?? 1);
      handGlow(g, Pz, C, chant);
    },
  });
  tintHurt(GRID, o);
  GRID.draw(p, Pz.fade ?? 1);
  const fade = Pz.fade ?? 1;
  if (fade > 0.05) p.glow(ORB[0] + Pz.shift, ORB[1] + Pz.bob + Pz.hop, 11 + chant * 5, C.arcane[2], (0.2 + chant * 0.18) * fade);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = goblinColors(o);
  const Pz = goblinAction(t, D, { ...o, phase: 0.12, mix: mageMix });
  const chant = chantAt(Pz.u);
  drawShadow(p, Pz, { fade: Pz.fade ?? 1, rx: 8.4, ry: 1.9, a: 0.34 });
  // a faint arcane seal on the ground while it hovers
  const y = 0.4;
  p.ring(Pz.shift * 0.6, y, 10.5, 1, C.arcane[1], (0.22 + chant * 0.1) * (Pz.fade ?? 1));
  for (let i = 0; i < 5; i++) {
    const a = Pz.ph * 0.25 + (i / 5) * TAU;
    p.dot(Pz.shift * 0.6 + Math.cos(a) * 9.2, y + Math.sin(a) * 1.6, C.arcane[2], 0.5 + chant * 0.3);
  }
}

function robe(g, Pz, C, sway) {
  const s = Pz.scale, sh = Pz.shift, by = Pz.bob + Pz.hop;
  const R = C.robe;
  const hem = [
    [-11.6, -3.6],
    [-9.8, -2.0],
    [-8.6, -5.0],
    [-6.8, -2.4],
    [-5.2, -5.4],
    [-3.4, -2.2],
    [-1.6, -5.0],
    [0.2, -2.0],
    [2.0, -4.8],
    [3.8, -2.4],
    [5.6, -5.2],
    [7.4, -2.6],
    [9.2, -5.4],
    [10.6, -3.2],
    [11.2, -5.8],
  ];
  const pts = [
    [-6.6, -29.6],
    [6.6, -29.6],
    [7.2, -16.0],
    ...hem.map(([x, y]) => [x + (y < -3.5 ? sway * 0.6 : sway), y]),
    [-7.4, -16.0],
  ];
  const inside = poly(pts.map(([x, y]) => [x, y]));
  paintGrid(g, Pz, boxPoly(pts), inside, R, { mid: 3, lit: 4, hi: 5, dark: 2, deep: 1 });
  // front panel and folds
  const panel = [
    [1.4, -28.6],
    [6.2, -28.8],
    [7.0, -17.4],
    [8.4, -4.4],
    [4.6, -3.0],
    [3.0, -16.8],
  ];
  g.poly(panel.map(([x, y]) => [Math.round((x + sh) * s), Math.round((y + by) * s)]), R[5]);
  for (const [x0, x1] of [[-4.6, -5.6], [-1.2, -1.8], [2.8, 3.6]]) {
    g.line(...at(Pz, x0, -16), ...at(Pz, x1 + sway, -4.2), R[2]);
  }
  g.line(...at(Pz, 4.6, -4.4), ...at(Pz, 7.2, -4.2), R[5]);
}

function robeBack(g, Pz, C, sway) {
  const pts = [
    [-7.4, -29.0],
    [-1.6, -29.0],
    [-2.6, -8.4],
    [-4.5, -5.4],
    [-6.4, -8.8],
    [-8.4, -6.2],
    [-9.6, -11.0],
    [-9.0, -19.0],
  ];
  paintGrid(g, Pz, boxPoly(pts), poly(pts), C.robe, { mid: 1, lit: 2, hi: 3, dark: 1, deep: 0 });
}

function mantle(g, Pz, C) {
  const pts = [
    [-7.2, -30.2],
    [7.2, -30.2],
    [7.8, -26.0],
    [5.6, -27.2],
    [3.8, -25.0],
    [1.8, -26.8],
    [-0.4, -24.8],
    [-2.4, -26.8],
    [-4.6, -25.0],
    [-6.6, -27.0],
    [-7.8, -25.2],
  ];
  paintGrid(g, Pz, boxPoly(pts), poly(pts), C.robe, { mid: 2, lit: 3, hi: 4, dark: 1, deep: 0 });
  g.poly(
    [
      [-2.6, -29.6],
      [2.4, -29.6],
      [2.0, -26.2],
      [-0.4, -24.6],
      [-2.2, -26.4],
    ].map(([x, y]) => at(Pz, x, y)),
    C.robe[3],
  );
  // bone clasp
  g.rect(...at(Pz, -0.8, -28.8), Math.max(1, Math.round(Pz.scale * 1.2)), Math.max(1, Math.round(Pz.scale * 2)), C.bone[5]);
}

function charm(g, Pz, C) {
  const s = Pz.scale;
  g.line(...at(Pz, 3.6, -22.4), ...at(Pz, 4.4, -17.2), C.leather[4]);
  g.set(...at(Pz, 4.5, -16.4), C.bone[5]);
  g.set(...at(Pz, 4.9, -16.0), C.bone[4]);
  g.set(...at(Pz, 4.2, -16.0), C.bone[3]);
}

function hat(g, Pz, C) {
  const H = { ...Pz, shift: Pz.shift + Pz.headX, bob: Pz.bob + Pz.headY };
  const s = H.scale, sh = H.shift, by = H.bob + H.hop;
  const R = C.robe, cx = 1.0, cy = -40.6;
  const X = (x) => (x + sh) * s, Y = (y) => (y + by) * s;
  // wide, slightly bent brim
  for (let py = Math.floor(Y(cy - 2.0)); py <= Math.ceil(Y(cy + 2.0)); py++)
    for (let px = Math.floor(X(cx - 7.4)); px <= Math.ceil(X(cx + 7.4)); px++) {
      const ux = px / s - sh, uy = py / s - by;
      const nx = (ux - cx) / 7.4, ny = (uy - cy) / 1.9;
      if (nx * nx + ny * ny > 1) continue;
      g.set(px, py, ny < -0.35 ? R[4] : ny > 0.4 ? R[1] : R[2]);
    }
  // a tall cone bent back at the tip
  const cone = [
    [-4.2, -40.9],
    [3.8, -40.9],
    [2.8, -45.2],
    [1.0, -49.4],
    [-0.6, -51.0],
    [-2.6, -49.2],
    [-3.4, -45.6],
    [-4.8, -43.0],
  ];
  const inside = poly(cone);
  paintGrid(g, H, boxPoly(cone), inside, R, { mid: 2, lit: 3, hi: 4, dark: 1, deep: 0 });
  // band, patch and a bone pin
  g.line(...at(H, -4.0, -42.0), ...at(H, 3.4, -42.4), C.leather[3]);
  g.line(...at(H, -4.0, -41.6), ...at(H, 3.4, -42.0), C.leather[4]);
  g.rect(...at(H, -0.8, -47.4), Math.max(1, Math.round(1.8 * s)), Math.max(1, Math.round(1.8 * s)), R[5]);
  g.set(...at(H, 0.0, -47.0), R[1]);
  g.set(...at(H, 3.2, -41.6), C.bone[5]);
  g.set(...at(H, -3.6, -46.2), R[1]);
}

function sash(g, Pz, C) {
  // rope belt with a knot and two hanging ends
  g.line(...at(Pz, -6.8, -15.6), ...at(Pz, 6.8, -16.2), C.leather[3]);
  g.line(...at(Pz, -6.8, -15.2), ...at(Pz, 6.8, -15.8), C.leather[4]);
  g.line(...at(Pz, -6.8, -16.0), ...at(Pz, 6.8, -16.6), C.leather[1]);
  g.rect(...at(Pz, 4.8, -16.4), Math.max(1, Math.round(1.6 * Pz.scale)), Math.max(1, Math.round(1.6 * Pz.scale)), C.leather[4]);
  g.line(...at(Pz, 5.2, -16.0), ...at(Pz, 4.6, -12.6), C.leather[3]);
  g.line(...at(Pz, 5.6, -15.8), ...at(Pz, 6.2, -13.0), C.leather[2]);
}

function staff(g, Pz, C) {
  const W = C.wood, M = C.metal;
  const pts = [[11.2, -2.2], [10.6, -13.0], [11.6, -22.0], [10.4, -31.0], [11.6, -39.4]];
  for (let i = 1; i < pts.length; i++) {
    g.line(...at(Pz, ...pts[i - 1]), ...at(Pz, ...pts[i]), W[2]);
    g.line(...at(Pz, pts[i - 1][0] + 0.7, pts[i - 1][1]), ...at(Pz, pts[i][0] + 0.7, pts[i][1]), W[4]);
    g.line(...at(Pz, pts[i - 1][0] + 1.2, pts[i - 1][1]), ...at(Pz, pts[i][0] + 1.2, pts[i][1]), W[5]);
  }
  // leather grip
  for (let i = 0; i < 3; i++) {
    g.line(...at(Pz, 10.4, -18.4 - i * 1.5), ...at(Pz, 11.4, -19.0 - i * 1.5), C.leather[4]);
  }
  // fork cradling the orb
  g.line(...at(Pz, 11.6, -39.4), ...at(Pz, 10.0, -43.0), W[3]);
  g.line(...at(Pz, 11.6, -39.4), ...at(Pz, 13.4, -43.0), W[3]);
  g.line(...at(Pz, 10.0, -43.0), ...at(Pz, 10.2, -44.6), W[4]);
  g.line(...at(Pz, 13.4, -43.0), ...at(Pz, 13.2, -44.6), W[4]);
  // a bone, a bead and a rune notch
  g.set(...at(Pz, 12.4, -33.6), M[4]);
  g.set(...at(Pz, 12.0, -27.2), C.bone[5]);
  g.line(...at(Pz, 10.8, -10.2), ...at(Pz, 11.4, -10.6), W[1]);
  // hand knuckles over the grip
  g.set(...at(Pz, 10.6, -20.0), C.skin[5]);
  g.set(...at(Pz, 11.4, -19.7), C.skin[4]);
}

function orb(g, Pz, C, chant) {
  const s = Pz.scale, sh = Pz.shift, by = Pz.bob + Pz.hop;
  const A = C.arcane, r = 3.0 + chant * 0.7;
  const cx = (ORB[0] + sh) * s, cy = (ORB[1] + by) * s;
  for (let y = Math.floor(cy - r * s); y <= Math.ceil(cy + r * s); y++)
    for (let x = Math.floor(cx - r * s); x <= Math.ceil(cx + r * s); x++) {
      const d = Math.hypot(x - cx, y - cy) / (r * s);
      if (d > 1) continue;
      let c = d > 0.82 ? A[1] : d > 0.5 ? A[2] : A[3];
      if (d < 0.34) c = A[4];
      if (d > 0.9 && (x + y) % 3 === 0) c = A[0];
      g.set(x, y, c);
    }
  // a thin rune ring around the orb, tick marks at four points
  g.ring(Math.round(cx), Math.round(cy), Math.round((r + 1.8) * s), 1, A[2], 0.55);
  for (let i = 0; i < 4; i++) {
    const a = Pz.ph * 0.5 + (i / 4) * TAU;
    g.set(Math.round(cx + Math.cos(a) * (r + 3) * s), Math.round(cy + Math.sin(a) * (r + 1.6) * s), A[3]);
  }
}

function motes(p, Pz, C, chant, fade = 1) {
  if (fade <= 0.05) return;
  for (let i = 0; i < 3; i++) {
    const a = Pz.ph * 0.7 + (i / 3) * TAU;
    const r = 9 + i * 2.4 + chant * 2;
    const x = ORB[0] + Pz.shift + Math.cos(a) * r * 0.8;
    const y = ORB[1] + Pz.bob + Pz.hop + Math.sin(a) * r * 0.45 - i * 1.5;
    p.dot(x, y, i === 0 ? C.arcane[3] : C.arcane[2], 0.75 * fade);
    p.glow(x, y, 3, C.arcane[2], 0.12 * fade);
  }
}

function handGlow(g, Pz, C, chant) {
  if (chant < 0.3) return;
  const [hx, hy] = Pz.hands.L;
  g.set(...at(Pz, hx, hy - 1.2), C.arcane[3]);
  g.set(...at(Pz, hx + 0.8, hy - 0.8), C.arcane[2]);
}

// --- unit-space helpers shared by the robe ---------------------------------------------------
function at(Pz, x, y) {
  const s = Pz.scale;
  return [Math.round((x + Pz.shift) * s), Math.round((y + Pz.bob + Pz.hop) * s)];
}

function poly(pts) {
  return (x, y) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
}

function boxPoly(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) (x0 = Math.min(x0, x)), (y0 = Math.min(y0, y)), (x1 = Math.max(x1, x)), (y1 = Math.max(y1, y));
  return [x0, y0, x1, y1];
}

/** Cel-shade a unit-space part into the grid; same contract as the shared painter. */
function paintGrid(g, Pz, box, inside, ramp, opt = {}) {
  const s = Pz.scale, sh = Pz.shift, by = Pz.bob + Pz.hop, du = 1 / s;
  const x0 = Math.floor((box[0] + sh) * s) - 1, x1 = Math.ceil((box[2] + sh) * s) + 1;
  const y0 = Math.floor((box[1] + by) * s) - 1, y1 = Math.ceil((box[3] + by) * s) + 1;
  for (let py = y0; py <= y1; py++)
    for (let px = x0; px <= x1; px++) {
      const ux = px / s - sh, uy = py / s - by;
      if (!inside(ux, uy)) continue;
      const up = inside(ux, uy - du), lf = inside(ux - du, uy), dn = inside(ux, uy + du), rt = inside(ux + du, uy);
      let c = ramp[opt.mid ?? 3];
      if (!up || !lf) c = ramp[opt.lit ?? 4];
      if (!up && !lf) c = ramp[opt.hi ?? 5];
      if (!dn || !rt) c = ramp[opt.dark ?? 2];
      if (!dn && !rt) c = ramp[opt.deep ?? 1];
      g.set(px, py, c);
    }
}
