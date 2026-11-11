// A fennec fox kit: ears twitch, it digs a flurry of sand out behind it, ears prick, it pounces
// on a sand-hopper, lands in dust, sits proud with its tail sweeping, then hops back.
import { fit, hex, mix, clamp, wrap, lerp, smooth, seg, ease, rng, TAU } from "../../core/index.js";
import { Grid, shift, spring, lnoise, shadow, toss } from "./_lib.js";

export const meta = {
  name: "Sand fox",
  desc: "A fennec kit digs a flurry of sand behind it, pricks its huge ears, pounces on a sand-hopper and lands in dust, then sits proud, tail sweeping.",
  tags: ["critter", "fox", "fennec", "desert", "animal", "loop"],
  size: [120, 88],
  origin: [60, 76],
  duration: 4.4,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#181008", "#33200e", "#5e3a18", "#8f5c24", "#bd8438", "#e2b45e", "#fbe8b0"],
    sand: ["#1c140c", "#3a2a16", "#5e4420", "#8a6230", "#b8884a", "#dcb06a", "#f8e0a0"],
    seed: 1,
  },
};

const D = meta.duration, GRID = new Grid(-22, -34, 44, 38);
const T_DIG0 = 0.7, T_DIG1 = 1.6, T_PERK = 1.7, T_POUNCE = 1.9, T_PLAND = 2.35, T_BACK = 3.6;
const NOSE = hex("#241812"), EYE = hex("#1c1008");

// pose: crouch k, dig paw phase, pounce q (in air), travel x, tail wag, ear perk
function pose(t) {
  let x = 0, by = 0, crouch = 0, dig = 0, q = -1, perk = 0, wag = 0;
  if (t >= T_DIG0 && t < T_DIG1) {
    crouch = smooth(T_DIG0, T_DIG0 + 0.15, t) * 0.7;
    dig = (t - T_DIG0) * 6;
  } else if (t >= T_DIG1) {
    crouch = t < T_POUNCE ? lerp(0.7, 0.5, seg(t, T_DIG1, T_POUNCE)) : 0.4;
    if (t >= T_PERK) perk = Math.min(1, (t - T_PERK) / 0.12);
  }
  if (t >= T_POUNCE && t < T_PLAND) {
    q = (t - T_POUNCE) / (T_PLAND - T_POUNCE);
    x = 17 * ease.outCubic(Math.min(1, q * 1.15));
    by = -14 * Math.sin(q * Math.PI);
    crouch = lerp(0.5, -0.25, Math.min(1, q * 1.6));
  } else if (t >= T_PLAND) {
    const age = t - T_PLAND;
    x = 17;
    crouch = 0.35 * spring(age, 2.6, 5) + 0.1;
    wag = Math.min(1, age * 3);
    if (t >= T_BACK) {
      const u = seg(t, T_BACK, T_BACK + 0.55);
      x = 17 * (1 - ease.inOutSine(u));
      by = -6 * Math.sin(u * Math.PI);
      crouch = u < 0.5 ? 0.35 : -0.1;
      wag = Math.max(0, 1 - u * 2);
    }
  }
  const earT = (t < T_PERK ? Math.max(0, Math.sin(t * TAU * 1.4) - 0.86) * 4 : 0) + perk;
  return { x, by, crouch, dig, q, perk, wag, earT };
}

// the kit faces right: haunched body, a head with a pointed muzzle, two huge ears, a dragged tail
function fox(g, C, P, t) {
  g.clear();
  const cr = P.crouch, lift = -cr * 3;
  const inBody = (x, y) => ((x + 2) / 9.5) ** 2 + ((y + 7 - lift) / (4.6 - cr * 0.8)) ** 2 < 1;
  const inHead = (x, y) => ((x - 7) / 5.6) ** 2 + ((y + 12.5 - lift * 1.4) / 5) ** 2 < 1;
  const inMuzzle = (x, y) => x > 9 && x < 14.5 && y > -12.6 - lift * 1.4 && y < -9.4 - lift * 1.4 && x - 9 + (y + 12 - lift * 1.4) * 0.7 < 5;
  const earH = 6.5 + P.earT * 1.8;
  const inEar = (x, y, s) => {
    const ex = 7 + s * 2.6, ey0 = -16.4 - lift * 1.4;
    const v = (ey0 - y) / earH;
    if (v < 0 || v > 1) return false;
    const tip = s > 0 ? 1.6 : -0.4; // ears tip apart
    return Math.abs(x - ex - tip * v * s) < lerp(2.6, 0.2, v);
  };
  const lit = (x, y, k) => inBody(-3 + (x + 3) / k, -9.6 + (y + 9.6) / k) || inHead(4 + (x - 4) / k, -15 + (y + 15) / k);
  g.shade(-15, -25, 16, 1, (x, y) => {
    for (const s of [-1, 1])
      if (inEar(x, y, s)) {
        const ex = 7 + s * 2.6, v = (-16.4 - lift * 1.4 - y) / earH;
        if (Math.abs(x - ex) < 0.9 && v < 0.55) return C[2]; // inner ear
        return lit(x, y, 0.6) ? C[5] : v > 0.8 ? C[4] : C[4 - (s < 0 ? 1 : 0)];
      }
    if (inMuzzle(x, y)) {
      if (x > 12.8 && y < -10.4 - lift * 1.4) return NOSE;
      return y < -11.6 - lift * 1.4 ? C[4] : C[5]; // pale muzzle
    }
    if (inHead(x, y) || inBody(x, y)) {
      if (y > -4.5) return C[5]; // pale belly/underside
      if (inHead(x, y) && x < 4 && y < -13 - lift * 1.4) return C[5];
      return lit(x, y, 0.5) ? C[5] : lit(x, y, 0.78) ? C[4] : C[3];
    }
    return 0;
  });
  // eye, shut mid-pounce
  const ey = Math.round(-13.4 - lift * 1.4);
  if (P.q >= 0 && P.q < 0.7) g.set(9, ey, C[5]), g.set(10, ey, C[5]);
  else g.set(9, ey, EYE), g.set(10, ey, EYE), g.set(9, ey, C[6]);
  // legs: front pair digging alternately, tucked in the air
  const tuck = P.q >= 0 ? 2.5 : 0;
  for (const s of [-1, 1]) {
    const pawLift = P.dig > 0 && s > 0 ? Math.max(0, Math.sin(P.dig * Math.PI)) * 2.5 : Math.max(0, Math.sin(P.dig * Math.PI + s)) * 0.7 * (P.dig > 0 ? 1 : 0);
    const lx = 6 + s * 1.8, ly = -1 - tuck - pawLift * (s > 0 ? 1 : 0);
    g.line(lx, -5 - lift, lx + (P.dig > 0 && s > 0 ? 1.5 : 0.5), ly, s > 0 ? C[4] : C[2]);
    // haunch + hind leg
    if (s > 0) {
      g.ellipse(-6, -4.5 - lift * 0.5, 4, 3.4 - cr, (nx, ny) => (ny > 0.4 ? C[2] : C[3]));
      g.line(-5, -3.5 - lift * 0.5, -4.5 + cr * 2, -1, C[3]);
    }
  }
  // the tail: a thick brush dragged behind, sweeping with the wag
  const wagX = Math.sin(t * TAU * 2.2) * 3 * P.wag, wagY = -Math.abs(Math.sin(t * TAU * 2.2)) * 1.5 * P.wag;
  const tip = [(-14 + wagX) * (P.q >= 0 ? 0.6 : 1), -3 + wagY - (P.q >= 0 ? 3 : 0)];
  g.tube([[-7, -6 - lift * 0.6], [-11, -4.5], tip], (u) => lerp(2.6, 1.1, u), (u, v) => (u > 0.8 ? C[6] : v > 0.5 ? C[2] : u > 0.4 ? C[4] : C[3]));
  g.outline(C[0]);
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), S = fit(o.sand, 7), P = pose(t);
  const g = GRID;
  // the growing sand heap the dig throws out behind it
  const digK = clamp(seg(t, T_DIG0, T_DIG1));
  if (digK > 0) {
    const fade = 1 - smooth(3.5, D - 0.15, t), hw = (3 + digK * 5) * (0.7 + 0.3 * fade);
    for (let x = Math.floor(-13 - hw); x <= -13 + hw; x++) {
      const h = (1 - Math.abs(x + 13) / hw) * (2 + digK * 2.4) * fade;
      for (let y = 0; y > -h; y--) p.dot(x - P.x * 0.4, y - 1, y > -1 ? S[4] : S[3], fade);
    }
  }
  fox(g, C, P, t);
  g.draw(p, 1, Math.round(P.x), Math.round(P.by));
  // sand flung back over the haunches while it digs
  if (P.dig > 0)
    for (let i = 0; i < 9; i++) {
      const r = rng(o.seed, i, Math.floor(P.dig * 2) + 5);
      const age = wrap(P.dig * 0.5 + i * 0.13, 0.5);
      const f = toss(P.x - 4, -6, -r.range(20, 55), -r.range(35, 80), age, 380, -1);
      if (f.landed) continue;
      p.dot(f.x, f.y, i % 2 ? S[4] : S[5], 1 - age * 0.8);
    }
  // the sand-hopper: a speck that hops away after the pounce lands
  const ha = wrap(t - T_PLAND, D);
  if (ha < 1.1 && ha > 0.12) {
    const r = rng(o.seed, 3, 41);
    const hq = ha / 1.1, hops = Math.floor(hq * 4), hu = (hq * 4) % 1;
    const hx = 19 + (hops + hu) * 5, hy = -Math.abs(Math.sin(hu * Math.PI)) * 5;
    p.px(hx, hy - 2, S[5]); p.px(hx + 1, hy - 2, S[4]);
    p.dot(hx + 0.5, hy - 3, S[3], 0.7);
  }
  // landing dust ring
  if (ha < 0.55 && ha > 0)
    for (let i = 0; i < 10; i++) {
      const r = rng(o.seed, i, 83), sgn = r.sign();
      p.dot(17 + sgn * (4 + r.range(10, 26) * ha * 3), -1 - r.range(0, 4) * ha * 1.4, S[3], clamp(1.2 - ha * 2.4));
    }
  p.glow(P.x, P.by - 9, 24, C[4], 0.1);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), P = pose(t);
  shadow(p, P.x - 1, -0.2, 12, 1.7, C[0], 0.5 - 0.25 * clamp(-P.by / 14));
}
