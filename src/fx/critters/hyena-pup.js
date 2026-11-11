// A scrappy hyena pup: it slinks low, bristles its hackles into a snarling shake with teeth
// bared and drool flying, snaps two lunging bites, then tosses its head and slinks back.
import { fit, hex, mix, clamp, wrap, lerp, smooth, seg, ease, rng, TAU } from "../../core/index.js";
import { Grid, shift, spring, lnoise, shadow, toss } from "./_lib.js";

export const meta = {
  name: "Hyena pup",
  desc: "A scrappy hyena pup slinks low, bristles its hackles into a snarling shake with bared teeth and flying drool, snaps two lunging bites, then slinks back.",
  tags: ["critter", "hyena", "dog", "snarl", "bite", "menace", "loop"],
  size: [116, 88],
  origin: [58, 76],
  duration: 4.2,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#120c0a", "#2a1c14", "#4a3020", "#6e4a2e", "#9a6c42", "#cf9c62", "#f4dcae"],
    maw: ["#3a0e14", "#7e2030", "#c84050", "#ff8a70"],
    seed: 1,
  },
};

const D = meta.duration, GRID = new Grid(-24, -30, 48, 34);
const T_SNARL = 0.85, T_BITE1 = 1.7, T_BITE2 = 2.15, T_TOSS = 2.6, T_BACK = 3.35;
const GUM = hex("#4a1020"), TOOTH = hex("#f0ecd8");

// pose: slink x, hackle bristle h, head shake, jaw open j, bite q, head toss
function pose(t) {
  let x = 0, h = 0, j = 0, shake = 0, bite = -1, tossA = 0, low = 0;
  if (t < T_SNARL) low = smooth(0.15, 0.6, t) * 0.4;
  if (t >= T_SNARL && t < T_BITE1) {
    const u = seg(t, T_SNARL, T_BITE1);
    h = smooth(0, 0.3, u); j = 0.3 + 0.5 * u; shake = Math.sin(t * TAU * 5.5) * 0.1 * u; low = 0.4;
  }
  for (const [t0, t1] of [[T_BITE1, T_BITE1 + 0.4], [T_BITE2, T_BITE2 + 0.4]])
    if (t >= t0 && t < t1) {
      const u = (t - t0) / 0.4;
      bite = u;
      x = 5 * Math.sin(u * Math.PI);
      j = u < 0.5 ? lerp(1, 0.2, u * 2) : lerp(0.2, 1, (u - 0.5) * 2);
      h = 1; low = 0.3;
    }
  if (t >= T_BITE2 + 0.4 && t < T_BACK) {
    j = 0.15; h = Math.max(0, 1 - (t - T_BITE2 - 0.4) / 0.4); low = 0.25;
    if (t >= T_TOSS && t < T_TOSS + 0.5) tossA = Math.sin((t - T_TOSS) * TAU * 1.8) * 0.14;
  }
  if (t >= T_BACK) x = 4 * (1 - ease.inOutSine(seg(t, T_BACK, T_BACK + 0.75)));
  else if (t >= T_BITE1 && bite < 0) x = 4;
  return { x, h, j, shake, bite, tossA, low };
}

function hyena(g, C, M, P, t) {
  g.clear();
  const hy = -P.low * 3 - P.bite * 0, headX = 9 + P.x * 0.4, headY = -11 + P.low * 2 - P.tossA * 14;
  const inBody = (x, y) => ((x + 3) / 10.5) ** 2 + ((y + 7 - P.low) / 5.2) ** 2 < 1;
  const inHead = (x, y) => ((x - headX) / 6.4) ** 2 + ((y - headY) / 5) ** 2 < 1;
  const inMuzzle = (x, y) => x > headX + 2 && x < headX + 8.4 && y > headY - 1 + P.j * 0.5 && y < headY + 2.8 + P.j * 2.6;
  const inEar = (x, y, s) => {
    const ex = headX + s * 2.6 - 1.4, ey = headY - 5.4;
    return Math.abs(x - ex) < lerp(1.9, 0.3, Math.max(0, (ey - y) / 3.4)) && y < ey && y > ey - 3.4;
  };
  const lit = (x, y, k) => inBody(-4 + (x + 4) / k, -9 + (y + 9) / k);
  g.shade(-16, -20, 20, 1, (x, y) => {
    for (const s of [-1, 1]) if (inEar(x, y, s)) return s > 0 ? C[4] : C[2];
    // hackles: bristled spikes along the neck and spine
    if (P.h > 0.05) {
      const bx = x + 1.5, spine = -10.5 + (x + 3) * 0.12;
      if (x > -10 && x < headX - 1 && y < spine && y > spine - 2.4 * P.h - Math.abs(Math.sin(x * 1.7)) * 1.2 * P.h) return y < spine - 1.6 * P.h ? C[5] : C[2];
    }
    if (inMuzzle(x, y)) {
      if (P.j > 0.15 && y > headY + 0.6 + P.j * 0.4) {
        // the open maw: dark gum, a tooth row under the snout
        if (y < headY + 1.4 + P.j * 1.1) return GUM;
        return Math.floor(x) % 2 === 0 ? TOOTH : GUM;
      }
      if (x > headX + 6.6 && y < headY) return hex("#1c0f0a"); // nose
      return y < headY ? C[4] : C[5];
    }
    if (inHead(x, y) || inBody(x, y)) {
      if (y > -4) return C[5]; // pale belly
      return lit(x, y, 0.5) ? C[5] : lit(x, y, 0.78) ? C[4] : C[3];
    }
    return 0;
  });
  // the eye: narrowed to a mean slit while it snarls
  const ey = Math.round(headY - 1.6);
  if (P.h > 0.3 || P.bite >= 0) g.set(Math.round(headX + 1.6), ey, C[0]), g.set(Math.round(headX + 2.6), ey, hex("#ffb040"));
  else g.set(Math.round(headX + 1.6), ey - 1, C[0]), g.set(Math.round(headX + 1.6), ey, C[0]);
  // legs: front pair braced, hind crouched
  for (const s of [-1, 1]) {
    g.line(headX - 2 + s * 1.4, -4.5 + P.low, headX - 1.4 + s * 1.4 + P.bite * 1.5, -0.5, s > 0 ? C[3] : C[2]);
    g.line(-8 + s * 1.8, -4 + P.low * 0.5, -7.6 + s * 1.8 + P.low, -0.5, s > 0 ? C[3] : C[2]);
  }
  // scruffy tail, low and bristled
  g.tube([[-12, -6 + P.low * 0.5], [-16, -3.4 + P.h * -1.2], [-18, -1.5 - P.h * 2]], (u) => lerp(1.8, 0.8, u), (u, v) => (u > 0.7 ? C[5] : C[2 + (u > 0.4 ? 1 : 0)]));
  g.outline(C[0]);
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), M = fit(o.maw, 4), P = pose(t);
  const g = GRID;
  hyena(g, C, M, P, t);
  g.draw(p, 1, Math.round(P.x));
  // drool flung off the jaws while it shakes and bites
  if (P.j > 0.5 || P.bite >= 0)
    for (let i = 0; i < 6; i++) {
      const r = rng(o.seed, i, Math.floor(t * 9) + 3), a2 = wrap(t * 1.5 + i * 0.2, 0.7);
      if (a2 > 0.55) continue;
      const hx = P.x + 14 + r.range(-2, 4) + a2 * r.range(6, 18), hy = -9 + a2 * a2 * 26;
      if (hy > -1) continue;
      p.dot(hx, hy, mix(M[3], C[6], 0.3), clamp(1.2 - a2 * 1.6));
    }
  // dust on the bite lunges
  for (const t0 of [T_BITE1, T_BITE2]) {
    const a2 = wrap(t - t0, D);
    if (a2 > 0.5) continue;
    for (let i = 0; i < 7; i++) {
      const r = rng(o.seed, i, t0 * 77), sgn = r.sign();
      p.dot(P.x + 6 + sgn * (4 + r.range(8, 20) * a2 * 3), -1 - r.range(0, 3) * a2, C[2], clamp(1.2 - a2 * 2.2));
    }
  }
  p.glow(P.x + 6, -9, 22, C[4], 0.08);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), P = pose(t);
  shadow(p, P.x + 1, -0.2, 13, 1.7, C[0], 0.55);
}
