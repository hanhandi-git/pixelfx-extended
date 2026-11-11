// A tumbleweed with eyes: a gust rolls it off, twigs spinning round the little face hiding
// inside; it rocks to a stop, then the wind changes and it tumbles home. Dust and shed twigs.
import { fit, hex, mix, clamp, wrap, lerp, smooth, seg, ease, rng, TAU } from "../../core/index.js";
import { shift, spring, lnoise, shadow } from "./_lib.js";

export const meta = {
  name: "Tumble-imp",
  desc: "A tumbleweed imp: a gust rolls it off with its twigs spinning round the little face inside; it rocks to a stop, then the wind turns and it tumbles back, shedding twigs and dust.",
  tags: ["critter", "tumbleweed", "desert", "wind", "roll", "loop"],
  size: [96, 88],
  origin: [48, 76],
  duration: 4,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#140e08", "#2c1e10", "#54381a", "#7d5526", "#a87a3a", "#d0a85c", "#f4dc9c"],
    sand: ["#1c140c", "#3a2a16", "#5e4420", "#8a6230", "#b8884a", "#dcb06a", "#f8e0a0"],
    seed: 1,
  },
};

const D = meta.duration, R = 13;
const T_OUT = [0.35, 1.7], T_BACK = [2.1, 3.6], TRIP = 28;

// x along its round trip, y bouncing while it rolls fast, rot the twig spin, rock after stopping
function pose(t) {
  let x = 0, rock = 0, spd = 0;
  if (t >= T_OUT[0] && t < T_OUT[1]) {
    const u = seg(t, T_OUT[0], T_OUT[1]);
    x = TRIP * ease.inOutSine(u); spd = Math.sin(u * Math.PI);
  } else if (t >= T_OUT[1] && t < T_BACK[0]) {
    x = TRIP;
    rock = Math.exp(-(t - T_OUT[1]) * 6) * Math.sin((t - T_OUT[1]) * TAU * 3) * 0.5;
  } else if (t >= T_BACK[0] && t < T_BACK[1]) {
    const u = seg(t, T_BACK[0], T_BACK[1]);
    x = TRIP * (1 - ease.inOutSine(u)); spd = Math.sin(u * Math.PI);
  } else if (t >= T_BACK[1]) {
    rock = Math.exp(-(t - T_BACK[1]) * 6) * Math.sin((t - T_BACK[1]) * TAU * 3) * 0.4;
  }
  const rot = -x / R;
  const by = -Math.abs(Math.sin((t / D) * TAU * 6)) * 3.4 * spd;
  return { x, by, rot: rot + rock * 0.6, spd };
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), S = fit(o.sand, 7), P = pose(t);
  const cx = P.x, cy = P.by - R;
  const Rr = rng(o.seed, 7, 3);
  // body of the ball: a dark mass the twigs read against, dimmer at the bottom
  p.shade(cx - R - 1, cy - R - 1, cx + R + 1, cy + R + 1, (x, y) => {
    const d = Math.hypot(x - cx, y - cy) / R;
    if (d > 1) return;
    p.blend(x, y, y - cy > R * 0.35 ? C[0] : C[1], 0.9);
  });
  // rim arc-dashes spinning with the ball: lit on top, darker below
  for (let i = 0; i < 14; i++) {
    const a0 = (i / 14) * TAU + P.rot + Rr.next() * 0.1, w = 0.24;
    const r = rng(o.seed, i, 13);
    if (r.chance(0.25)) continue;
    const c = Math.cos(a0) < 0 ? C[4] : C[3];
    p.arc(cx, cy, R - 0.4, 1.1, a0 - w, a0 + w, (u, v) => (v < 0.5 ? (Math.sin(a0) < -0.3 ? C[5] : c) : C[2]), 0.95);
  }
  // chords of twig across the ball
  for (let i = 0; i < 18; i++) {
    const a = Rr.next() * TAU + P.rot, chord = Rr.range(0.65, 1.1), off = Rr.range(0.1, 0.5), tone = Rr.int(0, 2);
    const dx = Math.cos(a), dy = Math.sin(a), px = -dy, py = dx;
    const L = R * chord, mx = cx + dx * R * off, my = cy + dy * R * off;
    p.line(mx - px * L * 0.5, my - py * L * 0.5, mx + px * L * 0.5, my + py * L * 0.5, (u) => (u < 0.18 || u > 0.82 ? C[2] : C[3 + Math.min(2, tone)]));
    if (Rr.chance(0.5)) p.line(mx, my, mx + px * Rr.range(2, 4) + dx * 2, my + py * Rr.range(2, 4) + dy * 2, C[2]);
  }
  // the face inside: eyes peering through the twigs, squinting while it spins fast
  const sway = Math.sin(P.rot * 0.5) * 0.9, ey = cy + 0.5;
  const shut = P.spd > 0.75, PALE = hex("#f8f0d8");
  for (const s of [-1, 1]) {
    const ex = Math.round(cx + s * 3 + sway);
    if (shut) p.px(ex, ey, C[0]), p.px(ex + 1, ey, C[0]);
    else {
      p.px(ex, ey - 1, PALE); p.px(ex + 1, ey - 1, PALE);
      p.px(ex, ey, PALE); p.px(ex + 1, ey, PALE);
      p.px(ex + (s > 0 ? 1 : 0), ey, C[0]); p.px(ex + (s > 0 ? 1 : 0), ey - 1, C[0]);
    }
  }
  // dust kicked up while it rolls
  if (P.spd > 0.25)
    for (let i = 0; i < 7; i++) {
      const r = rng(o.seed, i, Math.floor(t * 8) + 11);
      const a2 = wrap(t * 2 + i * 0.17, 0.8);
      if (a2 > 0.5) continue;
      const dir = t >= T_OUT[0] && t < T_BACK[0] ? 1 : -1;
      p.dot(cx + r.range(-6, 6) - dir * a2 * 16, -1 - r.range(0, 4) * a2, S[3], clamp(1 - a2 * 2) * P.spd);
    }
  // wind streaks at the gust fronts
  for (const [s, t0] of [[1, T_OUT[0]], [-1, T_BACK[0]]]) {
    const u = wrap(t - t0, D) / 0.5;
    if (u > 1) continue;
    for (let i = 0; i < 3; i++)
      p.line(cx - s * (12 + i * 3 + u * 7), cy + i * 4 - 3, cx - s * (7 + i * 3 + u * 7), cy + i * 4 - 3, S[2], 0.5 * Math.sin(u * Math.PI));
  }
  // twigs shed on the hard bounces
  for (let i = 0; i < 3; i++) {
    const a2 = wrap(t - (T_OUT[0] + 0.2 + i * 0.45), D);
    if (a2 > 0.7) continue;
    const r = rng(o.seed, i, 91);
    const x = cx - 4 + r.range(-2, 2) - a2 * r.range(10, 20), y = -R + Math.sin(a2 * 9) * 2 + a2 * a2 * 30;
    p.dot(x, Math.min(-1, y), C[3], clamp(1.2 - a2 * 1.8) * P.spd * 2);
  }
  p.glow(cx, cy, R * 1.7, C[4], 0.08);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), P = pose(t);
  shadow(p, P.x, -0.2, R * 0.9, 1.8, C[0], 0.5 - 0.2 * clamp(-P.by / 4));
}
