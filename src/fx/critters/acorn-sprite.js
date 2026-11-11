// A seed creature in an acorn-cap hat: it rocks in place, rolls off to the side, pops back
// upright with a wobble, and shakes a little leaf loose that twirls down past it.
import { fit, hex, mix, clamp, wrap, lerp, smooth, seg, ease, rng, TAU } from "../../core/index.js";
import { Grid, shift, spring, shadow, toss } from "./_lib.js";

export const meta = {
  name: "Acorn sprite",
  desc: "A seed critter in an acorn-cap hat rocks, then rolls away in a full tumble and pops back upright; it shakes a little leaf loose that twirls down past it.",
  tags: ["critter", "acorn", "seed", "forest", "roll", "loop"],
  size: [104, 80],
  origin: [52, 68],
  duration: 3,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#140d08", "#2c1c10", "#54341a", "#82551f", "#b57e33", "#e0b060", "#ffe8a8"],
    cap: ["#120c08", "#2a1a10", "#4a2e16", "#6e4620", "#99662e", "#c08c48", "#e8be80"],
    leaf: ["#0c1608", "#1c3310", "#2f531a", "#4a7d24", "#6ea832", "#a0d050", "#dcf088"],
    roll: 30,
    seed: 1,
  },
};

const D = meta.duration, GRID = new Grid(-15, -24, 30, 28);
const T_ROLL = 0.95, T_STOP = 1.5, T_UP = 1.85, T_SHAKE = 2.1;
const R = 10; // rolling radius in px

// pose: x travel, ang the body rotation (0 upright, grows through the roll and finishes the turn
// as it stands), s a little squash, lean an idle wobble
function pose(t, roll) {
  let x = 0, ang = 0, s = 0, lean = 0;
  const aEnd = roll / R;
  if (t >= T_ROLL && t < T_STOP) {
    const u = ease.inOutSine(seg(t, T_ROLL, T_STOP));
    x = roll * u; ang = aEnd * u;
  } else if (t >= T_STOP && t < T_UP) {
    x = roll;
    const u = seg(t, T_STOP, T_UP);
    ang = lerp(aEnd, TAU, ease.outCubic(Math.min(1, u * 1.25)));
    s = -0.2 * spring(u - 0.2, 3, 6);
  } else if (t >= T_UP) {
    const back = ease.inOutSine(Math.min(1, seg(t, T_UP, T_UP + 0.55)));
    x = roll * (1 - back); ang = 0;
    lean = t < T_SHAKE ? 0.04 * Math.sin(t * TAU * 1.2) : Math.sin((t - T_SHAKE) * TAU * 3.4) * Math.max(0, 1 - (t - T_SHAKE) / 0.7) * 0.16;
    s = t < T_SHAKE ? 0.02 * Math.sin(t * TAU) : -0.08 + 0.08 * Math.cos((t - T_SHAKE) * TAU * 6);
  } else {
    lean = 0.06 * Math.sin(t * TAU * 0.9);
    s = 0.02 * Math.sin(t * TAU * 1.4);
  }
  return { x, ang: ang + lean * (ang === 0 ? 1 : 0), s, up: 1 - Math.abs(Math.sin(ang)) };
}

// body space: u right, v down from the seed's center (which sits 9 px above the floor).
// a plump seed with a pointed bottom; a rough cap dome on top with a stem nub.
const hw = (v) => (v > 1.2 ? lerp(8.2, 3.6, Math.min(1, (v - 1.2) / 4)) : 8.2);
const inSeed = (u, v) => v > -4.6 && v < 5.4 && (u / hw(v)) ** 2 + ((v - 0.4) / 5.6) ** 2 < 1;
const capTop = (u) => -4.8 - 3.4 * Math.sqrt(Math.max(0, 1 - (u / 9.6) ** 2));
const inCap = (u, v) => v <= -4.4 && v >= capTop(u) - 0.4 && Math.abs(u) < 9.6;

function sprite(g, C, K, P, t) {
  g.clear();
  const cs = Math.cos(P.ang), sn = Math.sin(P.ang), sx = 1 / Math.sqrt(1 + P.s), sy = 1 + P.s;
  const loc = (x, y) => {
    const dx = x, dy = y + 9;
    return [(dx * cs + dy * sn) / sx, (-dx * sn + dy * cs) / sy];
  };
  const fwd = (u, v) => [sx * (u * cs - v * sn), sy * (u * sn + v * cs) - 9];
  const lit = (u, v, k) => inSeed(-3 + (u + 3) / k, -3 + (v + 3) / k) || inCap(-3 + (u + 3) / k, -3 + (v + 3) / k);
  g.shade(-14, -22, 14, 4, (x, y) => {
    const [u, v] = loc(x, y);
    if (v > -9.8 && v < -7.6 && Math.abs(u) < 1) return K[2]; // the stem nub
    if (inCap(u, v)) {
      if (v > -5.2) return K[2]; // the brim
      const n = Math.sin(u * 1.8 + 1) * Math.sin(v * 2.2) > 0.35;
      return lit(u, v, 0.55) ? (n ? K[4] : K[5]) : n ? K[2] : K[3];
    }
    if (!inSeed(u, v)) return 0;
    if (!inSeed(u + 1.6, v + 1.8)) return C[2];
    if (v > 2.8) return C[2];
    return lit(u, v, 0.5) ? C[5] : lit(u, v, 0.78) ? C[4] : C[3];
  });
  // face under the cap brim; only near upright
  if (P.up > 0.82) {
    const blink = t > 0.4 && t < 0.47;
    for (const s of [-1, 1]) {
      const [X, Y] = fwd(s * 2.6, -2.6).map(Math.round);
      if (blink) g.set(X, Y + 1, C[0]), g.set(X + 1, Y + 1, C[0]);
      else {
        g.set(X, Y, C[0]); g.set(X + 1, Y, C[0]);
        g.set(X, Y + 1, C[0]); g.set(X + 1, Y + 1, C[1]);
        g.set(X, Y, C[6]);
      }
    }
    const [mx, my] = fwd(0, -0.8).map(Math.round);
    g.set(mx, my, C[1]); g.set(mx - 1, my, C[1]);
  }
  g.outline((x, y, nx, ny) => (ny < 0 ? K[0] : C[0]));
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), K = fit(o.cap, 7), L = fit(o.leaf, 7), P = pose(t, o.roll);
  const g = GRID;
  sprite(g, C, K, P, t);
  g.draw(p, 1, Math.round(P.x), 0);
  // the leaf: shed during the shake, twirls down with a sway, lands and fades
  const la = wrap(t - (T_SHAKE + 0.12), D);
  if (la < 1.9) {
    const sway = Math.sin(la * TAU * 1.6) * (1 - la / 2.4);
    const f = toss(P.x + 2, -18, 4 + sway * 3, -2, la, 34, -1);
    const rot = la * 7 + sway, cs = Math.cos(rot), sn = Math.sin(rot), al = clamp(1.4 - la * 0.75);
    for (const [lx, ly] of [[-1.5, 0], [-0.5, -0.8], [0.5, 0], [1.5, 0.8], [-0.5, 0.8], [0.5, -0.8]])
      p.dot(f.x + lx * cs - ly * sn, f.y + lx * sn + ly * cs, lx === -1.5 ? L[6] : ly < 0 ? L[5] : L[3], al);
    p.glow(f.x, f.y, 5, L[4], 0.15 * al);
  }
  // dust kicked by the roll and the pop
  for (const [t0, n, pw] of [[T_ROLL, 5, 0.5], [T_STOP, 7, 0.7], [T_UP, 9, 0.9]]) {
    const a2 = wrap(t - t0, D);
    if (a2 > 0.8) continue;
    for (let i = 0; i < n; i++) {
      const r = rng(o.seed, i, t0 * 97), x0 = pose(t0, o.roll).x;
      const sgn = r.sign(), v = r.range(12, 34) * pw;
      const x = x0 + sgn * (5 + v * a2 * (1 - a2)), y = -1 - r.range(1, 4) * a2 * 2;
      p.dot(x, y, mix(C[2], hex("#8a7f92"), 0.6), clamp(1.2 - a2 * 1.6));
    }
  }
  p.glow(P.x, -9, 26, C[4], 0.1);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), P = pose(t, o.roll);
  shadow(p, P.x, -0.2, 9, 1.5, C[0], 0.55);
}
