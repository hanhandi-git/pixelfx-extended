// A fluffy penguin chick: it rocks its weight foot to foot, flaps its stubby flippers, tips
// onto its belly for a little slide, then sits up and breathes puffs of mist into the cold.
import { fit, hex, mix, clamp, wrap, lerp, smooth, seg, ease, rng, cycle, TAU } from "../../core/index.js";
import { Grid, shift, spring, lnoise, shadow } from "./_lib.js";

export const meta = {
  name: "Penguin chick",
  desc: "A fluffy penguin chick rocks foot to foot, flaps its stubby flippers, tips onto its belly for a slide, then sits up and breathes little puffs of mist.",
  tags: ["critter", "penguin", "bird", "winter", "animal", "loop"],
  size: [96, 96],
  origin: [48, 84],
  duration: 3.8,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#101624", "#202c48", "#37486e", "#55688e", "#7e92b4", "#b4c4dc", "#eef4ff"],
    belly: ["#5e6a84", "#aab8d0", "#e8f0fc"],
    beak: ["#7a3a10", "#d88428", "#ffc060"],
    seed: 1,
  },
};

const D = meta.duration, GRID = new Grid(-16, -34, 32, 38);
const T_FLAP = 1.05, T_SLIDE = 1.5, T_SLIDE_END = 2.1, T_UP = 2.4, T_BACK = 3.3;

// pose: rock of the waddle, flap amount, slide q (prone slide), x travel, squash s
function pose(t) {
  let x = 0, rock = Math.sin(t * TAU * 1.6) * 0.09, flap = 0, prone = 0, s = 0.02 * Math.sin(t * TAU * 2), by = 0;
  if (t >= T_FLAP && t < T_SLIDE) {
    flap = Math.sin(((t - T_FLAP) / (T_SLIDE - T_FLAP)) * Math.PI);
    rock = Math.sin(t * TAU * 6) * 0.05;
  }
  if (t >= T_SLIDE && t < T_UP) {
    const u = seg(t, T_SLIDE, T_SLIDE_END);
    prone = u < 0.35 ? ease.outCubic(u / 0.35) : 1 - smooth(0.9, 1, u) * 0;
    if (t < T_SLIDE_END) x = 13 * ease.outCubic(u);
    else x = 13;
    if (t >= T_SLIDE_END) prone = 1 - seg(t, T_SLIDE_END, T_UP) * 0;
    rock = 0;
  }
  if (t >= T_UP) {
    const u = seg(t, T_UP, T_UP + 0.3);
    prone = Math.max(0, 1 - ease.inOutSine(u));
    s = -0.12 * spring(u, 3, 6);
  }
  if (t >= T_BACK) x = 13 * (1 - ease.inOutSine(seg(t, T_BACK, T_BACK + 0.45)));
  else if (t >= T_SLIDE_END) x = 13;
  return { x, by, rock, flap, prone, s };
}

function chick(g, C, B, P, t) {
  g.clear();
  const pr = P.prone, rock = P.rock * (1 - pr);
  const cs = Math.cos(rock + pr * 1.25), sn = Math.sin(rock + pr * 1.25);
  // body space u,v about the chest (0,-8); prone tips it forward onto the belly
  const loc = (x, y) => {
    const dx = x, dy = y + 8 + pr * 2;
    return [(dx * cs + dy * sn) / (1 + P.s * 0.5), (-dx * sn + dy * cs) / (1 + P.s * 0.4) - 8 + pr * 2];
  };
  const fuzz = (x, y) => lnoise(t, D, 12, x * 0.8 + y * 0.6, 4) * 0.7;
  const inBody = (u, v) => (u / 7.4) ** 2 + ((v + 8) / 7.8) ** 2 < 1 + fuzz(u * 3, v * 3) * 0.06;
  const inBelly = (u, v) => (u / 5) ** 2 + ((v + 6.4) / 5) ** 2 < 1 && v > -9;
  const inFace = (u, v) => (u / 4.4) ** 2 + ((v + 11.8) / 3.6) ** 2 < 1;
  const lit = (u, v, k) => inBody(-3 + (u + 3) / k, -12 + (v + 12) / k);
  g.shade(-13, -24, 13, 2, (x, y) => {
    const [u, v] = loc(x, y);
    if (!inBody(u, v)) return 0;
    if (inFace(u, v) || (inBelly(u, v) && v < -2)) {
      const w = inFace(u, v) ? 0 : 1;
      return lit(u, v, 0.55) ? B[2] : B[1 + w * 0];
    }
    if (v > -3) return C[4];
    return lit(u, v, 0.5) ? C[5] : lit(u, v, 0.8) ? C[4] : C[3];
  });
  // eyes and beak on the face
  const fwd = (u, v) => {
    const su = u * (1 + P.s * 0.5), sv = (v + 8 - pr * 2) * (1 + P.s * 0.4);
    return [su * cs - sv * sn, su * sn + sv * cs - 8 - pr * 2];
  };
  const blink = t > 0.5 && t < 0.56, EYE = hex("#101018");
  for (const s of [-1, 1]) {
    const [X, Y] = fwd(s * 2.4, -11.6).map(Math.round);
    if (blink) g.set(X, Y, EYE), g.set(X + 1, Y, EYE);
    else g.set(X, Y, EYE), g.set(X + 1, Y, EYE), g.set(X + (s > 0 ? 1 : 0), Y, C[6]);
  }
  const [bx, byy] = fwd(0.6, -10.6).map(Math.round);
  g.set(bx, byy, hex("#d88428")); g.set(bx + 1, byy, hex("#ffc060"));
  // flippers: stubby wings flat at the sides, lifting and blurring during the flap
  for (const s of [-1, 1]) {
    const lift = P.flap * (3 + s), wob = P.flap > 0 ? Math.sin(t * TAU * 10 + s) * 1.4 * P.flap : 0;
    const [w0x, w0y] = [s * 6.4, -7], [w1x, w1y] = [s * (9.5 + P.flap * 0.5), -6 - lift - wob];
    g.tube([[w0x, w0y - 0], [(w0x + w1x) / 2, (w0y + w1y) / 2 - 0.6], [w1x, w1y]], (u) => lerp(1.9, 1, u), (u, v) => (v > 0.55 ? C[2] : C[3 + (s > 0 ? 1 : 0)]));
  }
  // feet peek out when upright
  if (P.prone < 0.4) for (const s of [-1, 1]) g.set(s * 3 + Math.round(rock * 4), 0, hex("#d88428")), g.set(s * 3 + 1 + Math.round(rock * 4), 0, hex("#d88428"));
  g.outline(C[0]);
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), B = fit(o.belly, 3), P = pose(t);
  const g = GRID;
  chick(g, C, B, P, t);
  g.draw(p, 1, Math.round(P.x), Math.round(P.by + P.prone * 3));
  // snow kicked out sideways during the slide
  const sa = wrap(t - T_SLIDE, D);
  if (sa < 0.7 && P.prone > 0.3)
    for (let i = 0; i < 8; i++) {
      const r = rng(o.seed, i, 23), sgn = r.sign();
      p.dot(P.x - 2 + sgn * (4 + r.range(6, 18) * sa * 2.4), -1 - r.range(0, 3) * sa, i % 2 ? C[5] : C[6], clamp(1.1 - sa * 1.7));
    }
  // breath puffs: two small mist clouds off the beak after it sits up
  for (let i = 0; i < 2; i++) {
    const t0 = T_UP + 0.35 + i * 0.45, ba = wrap(t - t0, D);
    if (ba > 0.75) continue;
    const k = ba / 0.75, bx = P.x + 4 + ba * 9, by2 = P.by + P.prone * 3 - 11 - ba * 6;
    p.disc(bx, by2, 1 + k * 2.6, mix(C[6], hex("#8a9cb8"), 0.5), (1 - k) * 0.5);
    p.disc(bx + 1.4, by2 - 0.6, 0.8 + k * 1.8, C[6], (1 - k) * 0.35);
  }
  p.glow(P.x, -10, 22, C[4], 0.1);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), P = pose(t);
  shadow(p, P.x + P.prone * 2, -0.2, 8.5 + P.prone * 3, 1.5, C[0], 0.5);
}
