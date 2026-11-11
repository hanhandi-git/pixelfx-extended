// A carnivorous plant: it sways with its lure wiggling, winds back with jaws gaping, lunges
// forward and snaps shut, then recoils dripping digestive drool that sizzles on the floor.
import { fit, hex, mix, clamp, wrap, lerp, smooth, seg, ease, rng, cycle, TAU } from "../../core/index.js";
import { Grid, shift, spring, lnoise, shadow, toss } from "./_lib.js";

export const meta = {
  name: "Snapjaw",
  desc: "A carnivorous plant sways with its lure wiggling, winds back with jaws gaping, lunges and snaps shut, then recoils dripping sizzling drool.",
  tags: ["critter", "plant", "flytrap", "forest", "bite", "menace", "loop"],
  size: [112, 104],
  origin: [56, 92],
  duration: 3.4,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#0a140a", "#14301a", "#1f5424", "#33802e", "#55ab3c", "#8ed45e", "#d8f8a0"],
    head: ["#160a10", "#33101f", "#5c1c33", "#8e2c46", "#c04454", "#e8686a", "#ffb890"],
    lure: ["#1a2e0a", "#4a7d1e", "#a8e040", "#f0ffb0"],
    seed: 1,
  },
};

const D = meta.duration, GRID = new Grid(-26, -56, 52, 60);
const T_WIND = 1.0, T_SNAP = 1.35, T_CLAP = 1.5, T_BACK = 2.1;
const MOUTH = hex("#2a0a12"), TOOTH = hex("#f0ecd8"), STEMC = null;

// pose: head pos (hx,hy), jaw open j (0 shut .. 1 wide), stem bend, lunge reach
function pose(t) {
  let hx = 4, hy = -34, j = 0.12, bend = 0.06 * Math.sin(t * TAU * 1.3);
  if (t >= T_WIND && t < T_SNAP) {
    const u = ease.inOutSine(seg(t, T_WIND, T_SNAP));
    hx = 4 - 10 * u; hy = -34 - 4 * u; j = lerp(0.12, 1, u); bend += -0.25 * u;
  } else if (t >= T_SNAP && t < T_BACK) {
    const u = (t - T_SNAP) / (T_BACK - T_SNAP);
    const reach = Math.sin(Math.min(1, u * 1.35) * Math.PI) * (u < 0.5 ? 1 : 1 - (u - 0.5) * 1.2);
    hx = -6 + 26 * reach; hy = -38 + 14 * Math.sin(Math.min(1, u * 1.2) * Math.PI * 0.62);
    j = u < 0.35 ? lerp(1, 0.75, u / 0.35) : Math.max(0, 1 - (u - 0.42) / 0.1); // CLAP shut
    bend = -0.19 + 0.5 * reach;
    if (u > 0.42 && u < 0.62) bend += Math.sin((u - 0.42) * TAU * 8) * 0.06 * (0.62 - u);
  } else if (t >= T_BACK) {
    const age = t - T_BACK;
    hx = 4 + 14 * Math.exp(-age * 3.5) - 10 * Math.exp(-age * 2.5) * (age < 1 ? Math.min(1, age * 4) : 0);
    hy = -34 - 3 * spring(age, 2.2, 4);
    j = 0.1 + 0.25 * spring(age, 2.4, 5);
    bend += 0.1 * Math.exp(-age * 3) * Math.sin(age * TAU * 1.6);
  }
  return { hx, hy, j, bend };
}

// the stem: a tapering tube from the root to under the head, leaf blades at the base
function stem(g, C, P, t) {
  const sway = lnoise(t, D, 6, 0, 8) * 1.5;
  const pts = [[-2, 0], [P.bend * 14 - 1, -14], [P.hx * 0.55 + P.bend * 8, -26], [P.hx - 2, P.hy + 6]];
  g.tube(pts, (u) => lerp(3.2, 1.6, u), (u, v) => (v > 0.6 ? C[1] : u > 0.7 ? C[3] : v < 0.2 ? C[4] : C[2]));
  // two leaves cupping the root
  for (const s of [-1, 1]) {
    const lift = Math.sin(t * TAU * 1.1 + s) * 0.5;
    const lp = [[s * 2, -1], [s * 8, -3 - lift], [s * 13, -2 - lift * 2], [s * 8, 0]];
    g.poly(lp, (x, y) => (Math.abs(x - s * 8) < 0.8 ? C[5] : x * s > 9 ? C[4] : C[3]));
  }
}
// the head: two lobes hinged at (hx, hy) like a flytrap — the lower lobe sits, the upper swings
// open by the jaw amount; teeth fringe both rims, a dark maw between, spots on the lobes
function head(g, K, P, t) {
  const open = P.j, cx = P.hx, cy = P.hy;
  const A = open * 1.15, cs = Math.cos(A), sn = Math.sin(A);
  const lowerIn = (x, y) => ((x - cx) / 11.6) ** 2 + ((y - cy) / 5.6) ** 2 < 1 && y > cy - 0.5;
  const upIn = (x, y) => {
    const u = x - cx, v = y - cy, ru = u * cs + v * sn, rv = -u * sn + v * cs;
    return (ru / 11.6) ** 2 + (rv / 5.6) ** 2 < 1 && rv < 0.5;
  };
  // the maw first so the lobes close over it
  if (open > 0.08)
    g.shade(cx - 9, cy - 9, cx + 9, cy + 7, (x, y) => {
      const inM = ((x - cx) / 8.4) ** 2 + ((y - cy + open * 2.5) / (2.5 + open * 5)) ** 2;
      if (inM > 1 || lowerIn(x, y) || upIn(x, y)) return 0;
      return inM > 0.6 ? MOUTH : mix(MOUTH, K[4], 0.3);
    });
  // lobes
  g.shade(cx - 12, cy - 14, cx + 12, cy + 7, (x, y) => {
    if (upIn(x, y)) {
      const u = x - cx, v = y - cy, ru = u * cs + v * sn, rv = -u * sn + v * cs;
      const e = (ru / 11.6) ** 2 + (rv / 5.6) ** 2;
      if (rv < -3.4) return K[5];
      if (e > 0.78) return K[2];
      for (const [sx, sy] of [[-4, -2.4], [2, -2.8], [6.5, -1.4]]) if (Math.abs(ru - sx) < 0.9 && Math.abs(rv - sy) < 0.9) return K[4];
      return K[3];
    }
    if (lowerIn(x, y)) {
      const e = ((x - cx) / 11.6) ** 2 + ((y - cy) / 5.6) ** 2;
      if (e > 0.8) return K[2];
      if (y - cy > 3.4) return K[2];
      for (const [sx, sy] of [[-5, 1.6], [1, 2.6], [6, 1.2]]) if (Math.abs(x - cx - sx) < 0.9 && Math.abs(y - cy - sy) < 0.9) return K[4];
      return x - cx > 4 ? K[4] : K[3];
    }
    return 0;
  });
  // teeth: spikes out of the lower lobe's top rim and the upper lobe's front rim
  for (let i = -4; i <= 4; i++) {
    const tx = cx + i * 2.1, edge = Math.sqrt(Math.max(0, 1 - ((i * 2.1) / 11.6) ** 2));
    if (i % 2 === 0) g.line(tx, cy + 0.4, tx + 0.4, cy - 1.6 * open - 0.4, TOOTH);
    // upper lobe teeth rotate with it
    const lx = i * 2.1, ly = -0.4, ux = cx + lx * cs + ly * sn, uy = cy - lx * sn + ly * cs;
    g.line(ux, uy, ux + 0.3 * cs + 1.5 * sn, uy - 0.3 * sn + 1.5 * cs, TOOTH);
  }
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), K = fit(o.head, 7), Lr = fit(o.lure, 4), P = pose(t);
  const g = GRID;
  g.clear();
  stem(g, C, P, t);
  head(g, K, P, t);
  g.outline(C[0]);
  g.draw(p);
  // the lure: a glowing bulb on a hair-thin stalk ahead of the mouth, wiggling to bait prey
  const wig = Math.sin(t * TAU * 2.6) * (2 + P.j * 2);
  const lx = P.hx + 13 + wig * 0.4, ly = P.hy - 6 - Math.abs(wig) * 0.4;
  p.line(P.hx + 9, P.hy - 3 - P.j * 3, lx, ly, C[2]);
  p.px(lx, ly, Lr[3]); p.px(lx, ly - 1, Lr[2]);
  p.glow(lx, ly, 7, Lr[2], 0.4 + 0.15 * Math.sin(t * TAU * 5));
  // drool: a string during the gape, a drip that falls after the clap and sizzles
  if (P.j > 0.6) {
    const dl = (P.j - 0.6) * 9;
    p.line(P.hx + 4, P.hy + 6 + P.j * 4.5, P.hx + 4.5, P.hy + 6 + P.j * 4.5 + dl, mix(K[5], C[6], 0.4), 0.7);
  }
  const da = wrap(t - T_BACK, D);
  if (da < 0.9) {
    const f = toss(P.hx * 0.6, -20, 2, 0, da, 300, -1);
    if (!f.landed) p.px(f.x, f.y, mix(K[5], C[6], 0.3)), p.px(f.x, f.y - 1, K[4]);
    else if (da - f.at < 0.5) {
      const k = (da - f.at) / 0.5;
      p.disc(f.x, -0.5, 1.5 + k * 3, K[4], (1 - k) * 0.6);
      p.glow(f.x, -1, 5, K[5], 0.3 * (1 - k));
    }
  }
  // dust shaken by the lunge
  const la = wrap(t - T_SNAP, D);
  if (la < 0.5)
    for (let i = 0; i < 7; i++) {
      const r = rng(o.seed, i, 37);
      p.dot(2 + r.range(-10, 10) + r.range(0, 16) * la, -1 - r.range(0, 3) * la, C[2], clamp(1.1 - la * 2.2));
    }
  p.glow(P.hx + 2, P.hy, 20, K[4], 0.1 + P.j * 0.08);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), P = pose(t);
  shadow(p, P.hx * 0.4, -0.2, 10 + Math.abs(P.hx) * 0.3, 1.8, C[0], 0.5);
}
