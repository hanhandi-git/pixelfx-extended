// A loose knot of fireflies over the floor: each wanders its own lazy path, abdomen pulsing,
// motes trailing off it; once a loop they chorus together in one bright pulse.
import { fit, hex, clamp, wrap, lerp, smooth, rng, TAU } from "../../core/index.js";
import { shift, lnoise, shadow } from "./_lib.js";

export const meta = {
  name: "Fireflies",
  desc: "A knot of fireflies wanders the air over the floor: each drifts its own lazy path with a pulsing abdomen and a fading mote trail, then they chorus in one bright pulse.",
  tags: ["critter", "firefly", "insect", "forest", "glow", "flying", "loop"],
  size: [128, 96],
  origin: [64, 86],
  duration: 4,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#0a1206", "#16290a", "#2a4d12", "#4d7d1e", "#8cc032", "#d8f060", "#faffc8"],
    seed: 1,
  },
};

const D = meta.duration, N = 6, BODY = hex("#131008");
// each fly's own lazy circuit: base frequency plus two wobble terms, phase and amplitude seeded
function flyAt(t, i, seed) {
  const r = rng(seed, i, 41);
  const a = (t / D) * TAU * r.int(1, 2);
  const f1 = r.range(1.6, 2.6), f2 = r.range(3.2, 5), p1 = r.next() * TAU, p2 = r.next() * TAU;
  return {
    x: (10 + r.range(6, 18)) * Math.sin(a + p1) + r.range(5, 9) * Math.sin(f1 * a + p2),
    y: -26 - r.range(4, 12) - r.range(5, 11) * Math.sin(f2 * a * 0.5 + p1 * 0.7) - 4 * Math.sin(f1 * a + p2 * 1.3),
  };
}
// abdomen pulse: a slow per-fly wink plus the shared chorus swell near t = 2.1
function pulse(t, i, seed) {
  const r = rng(seed, i, 87), ph = r.next() * TAU, bf = r.range(2.5, 4.5);
  const wink = smooth(-0.2, 0.5, Math.sin((t / D) * TAU * bf + ph));
  const chorus = Math.max(0, Math.sin(((t - 1.95) / 0.5) * Math.PI)) * (t > 1.95 && t < 2.45 ? 1 : 0);
  return clamp(wink * 0.75 + 0.25 + chorus * 0.9);
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7);
  for (let i = 0; i < N; i++) {
    const S = flyAt(t, i, o.seed), S0 = flyAt(t - 0.05, i, o.seed);
    const vx = S.x - S0.x, vy = S.y - S0.y, sp = Math.hypot(vx, vy) || 1;
    const k = pulse(t, i, o.seed), X = Math.round(S.x), Y = Math.round(S.y);
    // mote trail behind it
    for (let m = 1; m <= 3; m++) {
      const St = flyAt(t - 0.07 * m, i, o.seed);
      p.dot(St.x, St.y, C[3], k * (0.5 - m * 0.12));
      if (m === 1) p.glow(St.x, St.y, 4, C[4], 0.1 * k);
    }
    // wings: a flicker of pale pixels above the body while it moves
    if (sp > 0.4) {
      const fl = Math.sin(t * TAU * 14 + i * 2) > 0 ? -1 : -2;
      p.dot(X - vx / sp, Y + fl, C[5], 0.5 * clamp(k + 0.2));
    }
    // dark body, abdomen trailing the velocity
    p.px(X, Y, BODY);
    const ax = Math.round(X - (vx / sp) * 1.6), ay = Math.round(Y - (vy / sp) * 1.6 + 0.5);
    if (k > 0.3) p.px(ax, ay, k > 0.75 ? C[6] : C[5]);
    p.glow(ax, ay, 3 + k * 8, C[5], 0.35 * k);
    if (k > 0.85) p.glow(ax, ay, 14, C[6], 0.3 * (k - 0.85) * 4);
  }
  // faint ambience: the swarm's light gathered low over the floor
  p.glow(0, -20, 60, C[3], 0.06 + 0.04 * lnoise(t, D, 4, 0, 3));
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7);
  // a pool of green light under each fly, brighter as it dips
  for (let i = 0; i < N; i++) {
    const S = flyAt(t, i, o.seed), k = pulse(t, i, o.seed), near = clamp(1 - (-S.y - 14) / 34);
    p.glow(S.x, -1, 10 + 8 * near, C[4], (0.05 + 0.12 * near) * k);
  }
  shadow(p, 0, -0.2, 30, 2.2, C[0], 0.12);
}
