// A desert scarab trundling its ball of sand: three pushes one way, a pause while a sun-glint
// sweeps its wing cases, a buzzing hop in place, then three pushes back. One closed round trip.
import { fit, hex, mix, clamp, wrap, lerp, smooth, seg, ease, rng, TAU } from "../../core/index.js";
import { Grid, shift, spring, lnoise, shadow } from "./_lib.js";

export const meta = {
  name: "Scarab",
  desc: "A scarab pushes a ball of sand backwards in little trundles, pauses while a sun-glint sweeps its wing cases, buzzes its wings in a hop, then trundles back.",
  tags: ["critter", "scarab", "beetle", "desert", "insect", "loop"],
  size: [112, 80],
  origin: [56, 68],
  duration: 4,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#0c0a12", "#1c1424", "#33224a", "#4f3a6e", "#7a5aa0", "#b08cd8", "#e8d0ff"],
    shell: ["#100c08", "#33240c", "#6e4a14", "#a87020", "#d89c30", "#f8cc58", "#fff0a8"],
    sand: ["#1c140c", "#3a2a16", "#5e4420", "#8a6230", "#b8884a", "#dcb06a", "#f8e0a0"],
    seed: 1,
  },
};

const D = meta.duration, GRID = new Grid(-16, -26, 32, 30);
const TRIP = 26;
const STEPS_L = [[0.2, 0.5], [0.65, 0.95], [1.1, 1.4]]; // 0 -> -TRIP
const STEPS_R = [[3.0, 3.3], [3.4, 3.65], [3.7, 3.95]]; // -TRIP -> 0
const T_SHEEN = 1.9, T_BUZZ = 2.62, T_BUZZ_END = 2.95;

// walking phase: advances during trundle steps so the legs cycle with each push
function walkPh(t) {
  let w = 0;
  for (const [a, b] of [...STEPS_L, ...STEPS_R]) {
    if (t >= b) w += 1;
    else if (t >= a) w += seg(t, a, b);
  }
  return w;
}
function pose(t) {
  let x = 0, by = 0, tilt = 0, buzz = 0;
  for (let i = 0; i < 3; i++) {
    const [a, b] = STEPS_L[i];
    if (t >= b) x = (-TRIP * (i + 1)) / 3;
    else if (t >= a) {
      const u = seg(t, a, b);
      x = (-TRIP * (i + ease.inOutSine(u))) / 3;
      tilt = -0.05 * Math.sin(u * Math.PI);
    }
  }
  if (t >= 1.4 && t < 3.0) x = -TRIP;
  for (let i = 0; i < 3; i++) {
    const [a, b] = STEPS_R[i];
    if (t >= b) x = -TRIP + (TRIP * (i + 1)) / 3;
    else if (t >= a) {
      const u = seg(t, a, b);
      x = -TRIP + (TRIP * (i + ease.inOutSine(u))) / 3;
      tilt = 0.05 * Math.sin(u * Math.PI);
    }
  }
  if (t >= T_BUZZ && t < T_BUZZ_END) {
    const u = (t - T_BUZZ) / (T_BUZZ_END - T_BUZZ);
    buzz = Math.sin(u * Math.PI);
    by = -10 * buzz;
    tilt = -0.18 * buzz;
  } else if (t >= T_BUZZ_END) {
    const age = t - T_BUZZ_END;
    tilt = 0.08 * spring(age, 2.8, 6);
    by = -1.5 * Math.max(0, spring(age, 3, 7));
  }
  return { x, by, tilt, buzz, w: walkPh(t) };
}
const ballAt = (P) => P.x - 11.5;

function scarab(g, C, K, P, t) {
  g.clear();
  const cs = Math.cos(P.tilt), sn = Math.sin(P.tilt);
  const loc = (x, y) => [(x * cs + (y + 9) * sn), (-x * sn + (y + 9) * cs) - 9];
  const inBody = (u, v) => (u / 8.4) ** 2 + ((v + 9.2) / 5) ** 2 < 1;
  const inHead = (u, v) => u > 5.5 && (u / 9.6) ** 2 + ((v + 9) / 3.4) ** 2 < 1;
  const lit = (u, v, k) => inBody(-3.4 + (u + 3.4) / k, -11.6 + (v + 11.6) / k);
  const sa = wrap(t - T_SHEEN, D);
  g.shade(-13, -17, 13, -1, (x, y) => {
    const [u, v] = loc(x, y);
    if (inHead(u, v)) {
      // horn nub rising off the snout
      if (u > 8.6 && v < -9.5) return C[3];
      return lit(u, v, 0.62) ? C[4] : C[3];
    }
    if (!inBody(u, v)) return 0;
    let c = lit(u, v, 0.42) ? K[5] : lit(u, v, 0.72) ? K[4] : K[3];
    if (Math.abs(u) < 0.6 && v < -6.4) c = K[1]; // elytra seam
    if (!inBody(u + 1.8, v + 1.7)) c = K[2];
    if (v > -5.6) c = C[2]; // dark under-edge
    if (sa < 0.7 && Math.abs(u - lerp(-9, 9, sa / 0.7)) < 1 && v < -7) c = K[6]; // sheen sweep
    return c;
  });
  // legs: three a side, stepping with the walk phase, far side darker
  for (const s of [-1, 1])
    for (let l = 0; l < 3; l++) {
      const bx = -4.5 + l * 4.5, sw = Math.sin((P.w * Math.PI * 2 + l * 1.2 + (s < 0 ? Math.PI : 0)));
      const lift = P.buzz > 0 ? 1.5 * P.buzz : Math.max(0, sw) * 0.9;
      const [X0, Y0] = [bx, -5.6], [X1, Y1] = [bx + 3 * s + sw * s * 0.8, -1 - lift];
      g.line(X0, Y0, (X0 + X1) / 2 + s * 0.8, Y0 + 1.4, s < 0 ? C[1] : C[2]);
      g.line((X0 + X1) / 2 + s * 0.8, Y0 + 1.4, X1, Y1, s < 0 ? C[1] : C[2]);
    }
  g.outline(C[0]);
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), K = fit(o.shell, 7), S = fit(o.sand, 7), P = pose(t);
  const g = GRID;
  const bx = ballAt(P), rolling = P.w !== walkPh(t - 0.02);
  // the sand ball: a grained sphere rolling with the trundle, brighter on top
  const roll = -P.x / 6;
  p.shade(bx - 7, -14, bx + 7, 0, (x, y) => {
    const u = x - bx, v = y + 6.6, d = (u / 6.2) ** 2 + (v / 6) ** 2;
    if (d > 1) return;
    const grain = Math.sin(u * 2.2 + roll * 3) * Math.sin(v * 2 - roll) > 0.35;
    let c = v < -2.4 ? S[4] : S[3];
    if (grain) c = v < -2.4 ? S[5] : S[4];
    if (d > 0.82) c = S[2];
    if (v < -3.8 && Math.abs(u) < 2.6) c = S[5];
    p.px(x, y, c);
  });
  // grains tumbling off its crown while it rolls
  if (rolling)
    for (let i = 0; i < 4; i++) {
      const r = rng(o.seed, i, 53), a2 = wrap(t * 3 + i * 0.3, 1.2);
      if (a2 > 0.5) continue;
      p.dot(bx + r.range(-3, 3) - a2 * 6, -12 + r.range(-1, 1) + a2 * a2 * 14, S[4], 1 - a2 * 1.6);
    }
  scarab(g, C, K, P, t);
  g.draw(p, 1, Math.round(P.x), Math.round(P.by));
  // wing blur while it buzzes
  if (P.buzz > 0.05) {
    const wa = Math.sin(t * TAU * 26);
    p.dot(P.x - 2, P.by - 15 - wa, mix(K[6], hex("#ffffff"), 0.4), 0.5 * P.buzz);
    p.dot(P.x + 1, P.by - 16 + wa, mix(K[6], hex("#ffffff"), 0.4), 0.4 * P.buzz);
    p.glow(P.x, P.by - 10, 16, K[4], 0.2 * P.buzz);
  }
  // kicked dust when it lands
  const la = wrap(t - T_BUZZ_END, D);
  if (la < 0.6)
    for (let i = 0; i < 8; i++) {
      const r = rng(o.seed, i, 71), sgn = r.sign();
      p.dot(-TRIP + 4 + sgn * (3 + r.range(8, 20) * la * 2.4), -1 - r.range(0, 3) * la, S[3], clamp(1.1 - la * 1.8));
    }
  p.glow(P.x, P.by - 9, 20, K[3], 0.1);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), P = pose(t);
  shadow(p, P.x, -0.2, 9, 1.4, C[0], 0.5 - 0.25 * clamp(-P.by / 10));
  shadow(p, ballAt(P), -0.2, 6.5, 1.4, C[0], 0.45);
}
