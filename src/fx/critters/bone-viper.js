// A skeletal viper: a coil of vertebrae and ribs, a skull head raised on an S-neck swaying
// with a forked shadow tongue; it draws back, strikes forward with jaws clamping, and settles.
import { fit, hex, mix, clamp, wrap, lerp, smooth, seg, ease, rng, TAU } from "../../core/index.js";
import { Grid, shift, lnoise, shadow } from "./_lib.js";

export const meta = {
  name: "Bone viper",
  desc: "A skeletal viper sways on a coil of vertebrae and ribs, skull raised on an S-neck with a forked shadow tongue; it draws back and strikes, jaws clamping, then settles.",
  tags: ["critter", "snake", "bone", "undead", "strike", "menace", "loop"],
  size: [128, 88],
  origin: [64, 76],
  duration: 3.6,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#0e0c14", "#1e1a2c", "#38304c", "#5c5278", "#8a80ac", "#c0b8dc", "#f0ecff"],
    bone: ["#16121c", "#322a3e", "#564a64", "#7e7090", "#ac9ec4", "#d8ceea", "#ffffff"],
    eye: ["#0a2a12", "#2a8a40", "#6ee060", "#d0ffb8"],
    seed: 1,
  },
};

const D = meta.duration, GRID = new Grid(-34, -34, 68, 38);
const LEN = 54, NECK = 18;
const T_DRAW = 1.0, T_STRIKE = 1.35, T_BACK = 2.4;
const SOCKET = hex("#0a0812"), TONG = hex("#4a3a5e");

// head pose: hx/hy head pos, ext strike stretch, draw pullback, jaw open
function pose(t) {
  let ext = 0, draw = 0, jaw = 0.15;
  if (t >= T_DRAW && t < T_STRIKE) draw = ease.inOutSine(seg(t, T_DRAW, T_STRIKE));
  if (t >= T_STRIKE && t < T_BACK) {
    const u = (t - T_STRIKE) / (T_BACK - T_STRIKE);
    ext = u < 0.3 ? ease.outCubic(u / 0.3) : Math.max(0, 1 - (u - 0.45) / 0.3);
    jaw = u < 0.32 ? 0.9 : u < 0.55 ? 0.04 : lerp(0.04, 0.15, (u - 0.55) / 0.3);
    draw = 1 - ext;
  }
  const sway = Math.sin((t / D) * TAU * 1.2) * 1.8 + Math.sin(t * TAU * 9) * 0.25;
  const hx = 6 - draw * 6 + ext * 17 + sway * 0.5;
  const hy = -13 + draw * 3 + ext * 4.5;
  return { hx, hy, ext, draw, jaw, sway };
}

// spine: u px behind the head. u<NECK is the raised S-neck down to the floor coil.
function spine(u, t, P) {
  if (u < NECK) {
    const k = u / NECK;
    const x = P.hx - u * 0.8 - k * k * 5 + P.sway * (1 - k) * 0.5;
    const y = P.hy + k ** 1.55 * (-2.6 - P.hy) + Math.sin(k * Math.PI) * P.sway * 0.6;
    return [x, y];
  }
  const v = u - NECK, [nx, ny] = spine(NECK - 0.01, t, P);
  const wave = Math.sin(v * 0.32 - (t / D) * TAU * 2) * smooth(2, 10, v) * 2.6;
  const bump = Math.sin(v * 0.55) * 1.8 * (1 - smooth(24, 36, v)); // coil humps
  return [nx - v * 0.9 - Math.sin(v * 0.5) * 2, -2.6 - wave - bump];
}

function viper(g, C, B, E, P, t) {
  g.clear();
  // a solid body under the bones: a dark band along the whole spine
  const pts = [];
  for (let u = 0.5; u < LEN; u += 1.5) pts.push(spine(u, t, P));
  g.tube(pts, (u) => (u * LEN < NECK ? lerp(2.6, 2.2, u * LEN / NECK) : lerp(2.4, 0.7, (u * LEN - NECK) / (LEN - NECK))), B[1]);
  // vertebra beads every 2.2 px, brighter dorsal dot
  for (let u = 1.5; u < LEN; u += 2.2) {
    const [x, y] = spine(u, t, P), [xa, ya] = spine(u + 1.1, t, P);
    const ang = Math.atan2(ya - y, xa - x), r = u < NECK ? 1.7 : lerp(1.9, 0.6, u / LEN);
    g.ellipse(x, y, r + 0.4, r, (nx, ny) => (ny < -0.25 ? B[5] : ny > 0.45 ? B[2] : B[4]));
    g.set(x - Math.sin(ang) * r * 0.9, y + Math.cos(ang) * r * 0.9, B[3]);
    g.set(x + Math.sin(ang) * r * 0.9, y - Math.cos(ang) * r * 0.9, B[3]);
    // rib spikes off the coiled mid-body
    if (u > NECK + 2 && u < NECK + 20 && Math.floor(u / 2.2) % 2 === 0)
      g.line(x, y + 0.3, x + Math.sin(u * 0.9) * 3, y + 2.6, B[3]);
  }
  // the skull: a wedge with a socket and a fang; the lower jaw drops on the strike
  const { hx, hy, jaw } = P, dn = jaw * 2.4, up = jaw * 1.2;
  g.shade(hx - 3, hy - 4.5 - up, hx + 8, hy + 3.5 + dn, (x, y) => {
    const ux = (x - hx - 1.4) / 5.4, uy = (y - hy + 0.4) / 3.6;
    if (ux * ux + uy * uy > 1.1) return 0;
    if (y < hy - up - 1.2 + ux * 0.4) return 0;
    if (y > hy + 0.8 + dn * (0.3 + ux)) return 0;
    if (Math.hypot(x - hx - 2.4, y - hy + 0.8) < 1.5) return SOCKET;
    if (y < hy - 1.4) return B[5];
    if (x > hx + 4.8 || y > hy + 1.2) return B[2];
    return B[4];
  });
  // fangs
  g.line(hx + 5.6, hy - 0.4, hx + 6.2, hy + 1.6 + dn * 0.7, B[6]);
  g.line(hx + 4, hy, hx + 4.2, hy + 1.4 + dn * 0.5, B[6]);
  // lower jaw bar when open
  if (dn > 0.3) g.line(hx + 2.5, hy + 1 + dn, hx + 6, hy + 1.4 + dn, B[3]);
  g.outline(C[0]);
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), B = fit(o.bone, 7), E = fit(o.eye, 4), P = pose(t);
  const g = GRID;
  viper(g, C, B, E, P, t);
  g.draw(p);
  // the ghost eye in the socket, flaring on the strike
  const fl = 0.6 + 0.4 * Math.sin(t * TAU * 3) + P.ext * 0.6;
  p.px(P.hx + 2.4, P.hy - 0.8, E[2]); p.px(P.hx + 3.4, P.hy - 0.8, E[1]);
  p.glow(P.hx + 2.8, P.hy - 0.8, 6, E[2], 0.45 * fl);
  // the shadow tongue flicks out of the skull
  const flick = Math.max(0, Math.sin((t / D) * TAU * 3 + 0.6)) ** 0.7 * (1 - P.ext);
  if (flick > 0.1) {
    const L = 6 * flick, wig = Math.sin(t * 50) * 0.7;
    p.line(P.hx + 6.2, P.hy + 0.4, P.hx + 6.2 + L, P.hy + 0.7 + wig, TONG);
    if (L > 3.4) p.px(P.hx + 6.2 + L + 1, P.hy + wig - 0.4, TONG), p.px(P.hx + 6.2 + L + 1, P.hy + wig + 1.4, TONG);
  }
  // bone dust shaken loose on the draw and the strike
  for (const [t0, n] of [[T_DRAW, 4], [T_STRIKE, 9]]) {
    const a2 = wrap(t - t0, D);
    if (a2 > 0.7) continue;
    for (let i = 0; i < n; i++) {
      const r = rng(o.seed, i, t0 * 83), sgn = r.sign();
      p.dot(P.hx + sgn * (3 + r.range(6, 20) * a2 * 2.4), -1 - r.range(0, 4) * a2, C[3], clamp(1.1 - a2 * 1.7));
    }
  }
  p.glow(P.hx - 8, -9, 26, C[4], 0.09);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), P = pose(t);
  for (let u = NECK; u < LEN; u += 5) {
    const [x, y] = spine(u, t, P);
    shadow(p, x, -0.2, 3, 1.2, C[0], 0.4);
  }
  shadow(p, P.hx + 2, -0.2, 5.5, 1.4, C[0], 0.4 * clamp(1 + P.hy / 16));
}
