// A tarantula: it skitters a few steps, freezes, then rears up with front legs high and fangs
// out, lunges down snapping, and settles before skittering back.
import { fit, hex, mix, clamp, wrap, lerp, smooth, seg, ease, rng, TAU } from "../../core/index.js";
import { Grid, shift, spring, lnoise, shadow } from "./_lib.js";

export const meta = {
  name: "Tarantula",
  desc: "A tarantula skitters a few steps, freezes, rears up with front legs and fangs bared, lunges down snapping, then settles and skitters back.",
  tags: ["critter", "spider", "tarantula", "fangs", "menace", "loop"],
  size: [112, 88],
  origin: [56, 76],
  duration: 3.6,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#100a0e", "#241420", "#3e2436", "#5e3550", "#8a5478", "#c088b0", "#f0d0e8"],
    fang: ["#20100a", "#6e4620", "#c08c48", "#ffe8b0"],
    seed: 1,
  },
};

const D = meta.duration, GRID = new Grid(-22, -30, 44, 34);
const T_SKIT = 0.9, T_REAR = 1.35, T_LUNGE = 2.0, T_BACK = 2.75;

// pose: skitter x, rear q (front lifts), lunge surge, leg cycle
function pose(t) {
  let x = 0, rear = 0, surge = 0, w = 0;
  if (t >= 0.15 && t < T_SKIT) {
    const u = seg(t, 0.15, T_SKIT);
    x = 9 * ease.inOutSine(u); w = u * 3;
  } else if (t >= T_SKIT && t < T_REAR) x = 9;
  if (t >= T_REAR && t < T_LUNGE) {
    rear = ease.outCubic(seg(t, T_REAR, T_LUNGE));
    x = 9 - 2 * rear;
  } else if (t >= T_LUNGE && t < T_BACK) {
    const u = (t - T_LUNGE) / (T_BACK - T_LUNGE);
    surge = Math.sin(Math.min(1, u * 1.15) * Math.PI);
    rear = 1 - smooth(0.25, 0.6, u);
    x = 7 + 8 * ease.outCubic(Math.min(1, u * 1.3)) * (u < 0.5 ? 1 : 1 - (u - 0.5) * 0.7);
  } else if (t >= T_BACK) {
    const u = seg(t, T_BACK, T_BACK + 0.8);
    x = lerp(9, 0, ease.inOutSine(u));
    if (t > T_BACK + 0.15) w = seg(t, T_BACK + 0.15, T_BACK + 0.8) * 3;
  }
  return { x, rear, surge, w };
}

// legs: [hip x, hip y, side] — four a side, two joints, hair stubs
const LEGS = [[-4, -7, -1], [-1, -6, -1], [2, -6, -1], [5, -7, -1], [-4, -7, 1], [-1, -6, 1], [2, -6, 1], [5, -7, 1]];
function spider(g, C, F, P, t) {
  g.clear();
  const lift = P.rear * 7, tilt = -P.rear * 0.35 + P.surge * 0.3;
  const cs = Math.cos(tilt), sn = Math.sin(tilt);
  // abdomen: a fat oval behind, markings on its back
  g.shade(P.x - 16, -14 + P.surge * 0, P.x + 2, -2, (x, y) => {
    const d = ((x - P.x + 6) / 9) ** 2 + ((y + 7.5) / 6.4) ** 2;
    if (d > 1) return 0;
    let c = y < -9.5 ? C[4] : y > -4 ? C[1] : C[3];
    if (d > 0.82) c = C[2];
    // the skull-ish mark on its back
    if (y < -9 && Math.abs(x - P.x + 6 + (y + 9.5) * 0.4) < 1.4) c = C[5];
    if (Math.abs(x - P.x + 6) < 0.7 && y < -4 && y > -8) c = C[2];
    return c;
  });
  // cephalothorax, tilting up on the rear
  const cx = P.x + 5, cy = -7 - lift * 0.75;
  g.shade(cx - 6, cy - 5, cx + 6, cy + 5, (x, y) => {
    const u = x - cx, v = y - cy, ru = u * cs + v * sn, rv = -u * sn + v * cs;
    if ((ru / 5.4) ** 2 + (rv / 4.2) ** 2 > 1) return 0;
    if (rv < -2.4) return C[4];
    return ru > 3.4 || rv > 2.8 ? C[2] : C[3];
  });
  // legs: hip to knee to foot, stepping with w, front pair lifted on the rear
  for (let i = 0; i < 8; i++) {
    const [hx0, hy0, s] = LEGS[i], near = s > 0, front = i % 4 >= 2;
    const hx = P.x + hx0, hy = hy0 - (front ? lift * 0.8 : 0);
    const sw = Math.sin(P.w * Math.PI * 2 + i * 1.35 + (near ? 0 : Math.PI));
    const reach = front ? 7 + P.rear * 3 : 7.5, drop = front ? -2 - P.rear * 6 : 7;
    const kx = hx + s * reach * 0.55 + sw * (front ? 0.8 : 1.4) * s, ky = hy + drop * 0.45 - (front ? P.rear * 4 : 0) - (P.surge && front ? -2 : 0);
    const fx = hx + s * reach + sw * s * (front ? 1 : 1.8), fy = front ? hy + drop - P.rear * 3 : -0.5 - Math.max(0, sw) * 1.2;
    g.line(hx, hy, kx, ky, near ? C[3] : C[1]);
    g.line(kx, ky, fx, fy, near ? C[3] : C[1]);
    // hair: two stubs off each knee
    g.px(kx + s * 1.2, ky - 0.5, C[3]);
  }
  // fangs under the front of the cephalothorax, out on the rear, snapping on the lunge
  const fang = P.rear + P.surge;
  for (const s of [-1, 1]) {
    const fx0 = cx + 4.2, fy0 = cy + 2.4 + s * 0.4;
    g.line(fx0, fy0, fx0 + 2.6, fy0 + 1.8 + fang * 1.6, fang > 0.4 ? F[3] : F[2]);
  }
  // eyes: a cluster of beads on the front-top
  for (const [ex, ey] of [[3.2, -2.2], [4.6, -1.8], [2.4, -1.2], [4.8, -0.6]])
    g.set(cx + ex, cy + ey, P.rear > 0.5 || P.surge > 0.3 ? hex("#ff5040") : C[5]);
  g.outline(C[0]);
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), F = fit(o.fang, 4), P = pose(t);
  const g = GRID;
  spider(g, C, F, P, t);
  g.draw(p);
  // dust on the lunge landing and the skitters
  for (const [t0, n, pw] of [[T_LUNGE + 0.35, 9, 1], [0.15, 4, 0.4], [T_BACK, 5, 0.5]]) {
    const a2 = wrap(t - t0, D);
    if (a2 > 0.6) continue;
    for (let i = 0; i < n; i++) {
      const r = rng(o.seed, i, t0 * 89), sgn = r.sign();
      p.dot(P.x + sgn * (6 + r.range(8, 22) * a2 * 2.6), -1 - r.range(0, 3) * a2, C[2], clamp(1.1 - a2 * 1.9) * pw);
    }
  }
  p.glow(P.x + 2, -8, 22, C[4], 0.08);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), P = pose(t);
  shadow(p, P.x - 1, -0.2, 12, 1.7, C[0], 0.55);
}
