// A forest mushroom sprite: bounces in place like its slime cousins, gills glowing under the cap,
// luminous spores drifting off it, a shake that lets a puff of them loose.
import { fit, clamp, wrap, lerp, smooth, seg, ease, rng, cycle, TAU } from "../../core/index.js";
import { Grid, shift, spring, lnoise, shadow } from "./_lib.js";

export const meta = {
  name: "Shroomling",
  desc: "A little mushroom sprite bounces in place: it squashes, hops with its cap trailing, lands wobbling, then shakes a puff of glowing spores loose that drift down around it.",
  tags: ["critter", "mushroom", "forest", "spores", "hop", "loop"],
  size: [104, 88],
  origin: [52, 76],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#161014", "#2e221c", "#574233", "#8a6b4c", "#c2a678", "#efe0b8", "#fff8e0"],
    cap: ["#1c0a16", "#471019", "#8a1f2e", "#c9373f", "#f2685a", "#ffab8a", "#ffe3c9"],
    hop: 15,
    seed: 1,
  },
};

const D = meta.duration, GRID = new Grid(-20, -40, 40, 44);
const T_SQ = 0.85, T_LIFT = 1.12, T_LAND = 1.62, T_SHAKE = 1.95;
const SW = 5, SH = 13, CW = 14, CH = 8.5;

// the pose at loop time t: s > 0 stretched, s < 0 squashed; by lift; lean of the cap over the foot
function pose(t) {
  const age = wrap(t - T_LAND, D);
  let s = 0, by = 0, lean = 0, wig = 0, q = -1;
  if (t >= T_LIFT && t < T_LAND) {
    q = (t - T_LIFT) / (T_LAND - T_LIFT);
    by = -meta.options.hop * 4 * q * (1 - q);
    s = q < 0.3 ? lerp(0.34, 0.05, q / 0.3) : lerp(0.05, 0.14, (q - 0.3) / 0.7);
    lean = Math.sin(q * Math.PI) * 0.9;
  } else if (t >= T_SQ && t < T_LIFT) {
    const u = seg(t, T_SQ, T_LIFT);
    s = u < 0.7 ? -0.26 * ease.inOutSine(u / 0.7) : lerp(-0.26, 0.34, ease.outCubic((u - 0.7) / 0.3));
  } else {
    s = age < 0.05 ? -0.3 : -0.3 * spring(age - 0.05, 2.4, 5.5);
    lean = 0.12 * Math.exp(-age * 5) * Math.sin(age * TAU * 2.2);
    if (t < T_SQ) s += 0.02 * Math.sin((t / T_SQ) * TAU);
    if (t >= T_SHAKE) wig = Math.sin((t - T_SHAKE) * TAU * 3.2) * (1 - (t - T_SHAKE) / (D - T_SHAKE)) * 1.6;
  }
  const sh = SH * (1 + s * 0.8), sw = SW / Math.sqrt(1 + s * 0.55);
  const cw = CW / Math.sqrt(1 + s * 0.3), ch = CH * (1 + s * 0.3);
  return { s, by, lean, wig, q, age, sh, sw, cw, ch };
}

// stem: a rounded column, wider at the top where it meets the cap, leaning with the pose
const inStem = (P, x, y) => {
  const v = (y - P.by) / -P.sh; // 0 base .. 1 top
  if (v < 0 || v > 1) return false;
  const xo = P.lean * v * P.sh * 0.35 + P.wig * v * v * 2.2;
  return Math.abs(x - xo) <= P.sw * (0.82 + 0.3 * v) * Math.sqrt(Math.max(0, 1 - (v > 0.94 ? (v - 0.94) * 9 : 0) ** 2)) + 0.4;
};
// cap: a dome sitting on the stem top; its underside is a flat gill plane
const capC = (P) => [P.lean * P.sh * 0.35 + P.wig * 2.2, P.by - P.sh - P.ch * 0.32];
const inCap = (P, x, y) => {
  const [cx, cy] = capC(P);
  const u = (x - cx) / P.cw, v = (y - cy) / P.ch;
  return u * u + v * v <= 1 && v < 0.52;
};
const capTop = (P, x) => {
  const [cx, cy] = capC(P);
  return cy - P.ch * Math.sqrt(Math.max(0, 1 - ((x - cx) / P.cw) ** 2));
};

function shroom(g, C, K, P, t) {
  const yb = P.by - 1;
  const [ccx, ccy] = capC(P);
  const lit = (x, y, k) => inCap(P, ccx - P.cw * 0.42 + (x - (ccx - P.cw * 0.42)) / k, ccy - P.ch * 0.4 + (y - (ccy - P.ch * 0.4)) / k);
  g.clear();
  // stem
  g.shade(-10, Math.floor(yb - P.sh - 2), 10, 1, (x, y) => {
    if (!inStem(P, x, y)) return 0;
    const v = (y - P.by) / -P.sh;
    let c = C[3];
    if (v > 0.75) c = C[4];
    const xo = P.lean * v * P.sh * 0.35 + P.wig * v * v * 2.2;
    if (x - xo > P.sw * (0.82 + 0.3 * v) - 1.4) c = C[2]; // right shade
    if (x - xo < -P.sw * (0.82 + 0.3 * v) + 1.4) c = C[5];
    if (v < 0.18) c = C[2];
    return c;
  });
  // cap dome: lit top-left, shaded rim below, pale spots on the dome
  g.shade(Math.floor(ccx - P.cw - 2), Math.floor(ccy - P.ch - 2), Math.ceil(ccx + P.cw + 2), Math.ceil(ccy + P.ch), (x, y) => {
    if (!inCap(P, x, y)) return 0;
    const v = (y - ccy) / P.ch;
    let c = lit(x, y, 0.45) ? K[5] : lit(x, y, 0.75) ? K[4] : K[3];
    if (v > 0.28) c = v > 0.44 ? K[1] : K[2]; // gill plane under the rim
    else if (!inCap(P, x + 1.6, y + 1.6)) c = K[2];
    else if (!inCap(P, x + 2.6, y)) c = K[1];
    for (const [sx, sy] of [[-0.52, -0.62], [-0.1, -0.85], [0.38, -0.55], [0.62, -0.15], [-0.3, -0.3]])
      if (Math.abs(x - (ccx + sx * P.cw)) < 0.9 && Math.abs(y - (ccy + sy * P.ch)) < 0.9) c = K[6];
    return c;
  });
  // gill lines under the cap where it overhangs the stem
  for (let x = Math.floor(ccx - P.cw * 0.6); x <= ccx + P.cw * 0.6; x += 2)
    if (inCap(P, x, ccy + P.ch * 0.5) && !inStem(P, x, ccy + P.ch * 0.75)) g.set(x, Math.round(ccy + P.ch * 0.52), K[0]);
  // little feet
  for (const s of [-1, 1]) {
    const fx = s * (P.sw * 0.9 + 0.6) + P.lean * 0.4;
    for (let x = Math.floor(fx - 1.6); x <= Math.ceil(fx + 1.6); x++)
      for (let y = -2; y <= 0; y++) if (Math.abs(x - fx) + (0 - y) * 0.8 < 2.1 && inStem(P, x, -1) === false && !inCap(P, x, y)) g.set(x, y, y === -2 ? C[4] : C[3]);
  }
  // face on the stem: eyes that squint on landing, a blink, a mouth
  const vF = 0.62, fx0 = P.lean * vF * P.sh * 0.35 + P.wig * vF * vF * 2.2, ey = Math.round(P.by - P.sh * vF);
  const shut = P.age < 0.14 && P.q < 0, blink = t > 0.45 && t < 0.52;
  for (const s of [-1, 1]) {
    const ex = Math.round(fx0 + s * 1.6);
    if (shut) g.set(ex, ey, C[0]), g.set(ex + 1, ey + s * 0, C[0]);
    else if (blink) g.set(ex, ey, C[0]), g.set(ex + 1, ey, C[0]);
    else {
      g.set(ex, ey - 1, C[0]); g.set(ex + 1, ey - 1, C[0]);
      g.set(ex, ey, C[0]); g.set(ex + 1, ey, C[0]);
      g.set(ex, ey - 1, C[6]);
    }
  }
  if (!shut) g.set(Math.round(fx0), ey + 2, C[1]);
  g.outline((x, y, nx, ny) => (ny < 0 && y < ccy ? K[0] : C[0]));
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), K = fit(o.cap, 7), P = pose(t);
  const g = GRID;
  shroom(g, C, K, P, t);
  g.draw(p);
  const [ccx, ccy] = capC(P);
  // spores drifting off the cap rim all the time
  cycle(t, D, 8, o.seed * 31 + 1, (r) => r.range(1.6, 2.4), (ag, L, r, i) => {
    const k = ag / L;
    const born = wrap(t - ag, D), P0 = pose(born), [cx0, cy0] = capC(P0);
    const a = r.range(-1, 1) * 1.2, x0 = cx0 + Math.sign(a || 1) * P0.cw * (0.55 + 0.4 * Math.abs(a)), y0 = cy0 + P0.ch * 0.4;
    const x = x0 + Math.sin(ag * 2.4 + i * 2.1) * 2.5 + a * ag * 3, y = Math.min(8, y0 + r.range(3, 6) * ag + 3 * ag * ag);
    const al = Math.min(1, k * 5) * Math.min(1, (1 - k) * 3), tw = 0.7 + 0.3 * Math.sin(ag * 9 + i);
    p.dot(x, y, tw > 0.85 ? K[6] : K[5], al);
    p.glow(x, y, 4, K[5], 0.3 * al * tw);
  });
  // the shake lets a puff of spores loose
  const sa = wrap(t - T_SHAKE, D);
  if (sa < 0.9)
    for (let i = 0; i < 12; i++) {
      const r = rng(o.seed, i, 77), L = r.range(0.5, 0.9);
      if (sa > L) continue;
      const k = sa / L, a = r.range(-0.9, 0.9) - Math.PI / 2, sp = r.range(14, 34);
      const x = ccx + Math.cos(a) * sp * sa * (1 + sa), y = ccy - P.ch * 0.5 + Math.sin(a) * sp * sa + 26 * sa * sa;
      const al = (1 - k) * Math.min(1, k * 6);
      p.dot(x, y, k < 0.4 ? K[6] : K[4], al);
      if (i % 3 === 0) p.glow(x, y, 4, K[5], 0.35 * al);
    }
  // light: the gills glow up into the cap and down onto the stem, the spores tint the air
  const fl = 0.85 + 0.15 * lnoise(t, D, 10, 0, 6);
  p.glow(ccx, ccy + P.ch * 0.5, 16, K[4], 0.16 * fl);
  p.glow(ccx, ccy - P.ch * 0.4, 12, K[5], 0.12 * fl);
  p.glow(ccx, P.by - P.sh * 0.5, 34, K[3], 0.12 * fl);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), K = fit(o.cap, 7), P = pose(t);
  const hgt = clamp(-P.by / meta.options.hop);
  shadow(p, 0, -0.2, 11 * (1 - 0.3 * hgt), 1.5, C[0], 0.55 - 0.25 * hgt);
  p.glow(0, -1, 22, K[4], 0.1 + 0.06 * hgt);
}
