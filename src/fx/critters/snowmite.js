// A living snowball: coal eyes, twig arms, an ice sprout on top. It squashes, hops, splats
// into powder and wobbles back together; snowflakes drift down and settle on it.
import { fit, hex, mix, clamp, wrap, lerp, smooth, seg, ease, rng, cycle, sparkle, TAU } from "../../core/index.js";
import { Grid, shift, spring, lnoise, shadow, toss } from "./_lib.js";

export const meta = {
  name: "Snowmite",
  desc: "A living snowball with coal eyes and twig arms squashes, hops, splats into powder and wobbles back together; snowflakes drift down and settle on its crown.",
  tags: ["critter", "snow", "snowball", "winter", "hop", "loop"],
  size: [96, 88],
  origin: [48, 76],
  duration: 2.6,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#0a1020", "#16244a", "#2a4070", "#4a6aa0", "#7a9cd0", "#c0d8f8", "#ffffff"],
    twig: ["#140c08", "#2c1c10", "#4a2e16", "#6e4620", "#99662e"],
    ice: ["#0e2a44", "#2a6aa8", "#5cb0e0", "#b8ecff"],
    hop: 20,
    seed: 1,
  },
};

const D = meta.duration, GRID = new Grid(-18, -50, 36, 54);
const T_SQ = 0.9, T_UP = 1.15, T_LIFT = 1.2, T_LAND = 1.68, R0 = 10.5;

function pose(t) {
  const age = wrap(t - T_LAND, D);
  let s = 0, by = 0, arm = 0, q = -1;
  if (t >= T_LIFT && t < T_LAND) {
    q = (t - T_LIFT) / (T_LAND - T_LIFT);
    by = -meta.options.hop * 4 * q * (1 - q);
    s = q < 0.25 ? lerp(0.3, 0.04, q / 0.25) : lerp(0.04, 0.1, (q - 0.25) / 0.75);
    arm = Math.sin(q * Math.PI);
  } else if (t >= T_SQ && t < T_LIFT) {
    const u = seg(t, T_SQ, T_LIFT);
    s = u < 0.75 ? -0.3 * ease.inOutSine(u / 0.75) : lerp(-0.3, 0.34, ease.outCubic((u - 0.75) / 0.25));
    arm = -0.5 * ease.inOutSine(u);
  } else {
    s = age < 0.05 ? -0.34 : -0.34 * spring(age - 0.05, 2.5, 5.5);
    arm = -0.3 * Math.exp(-age * 4);
    if (t < T_SQ) s += 0.02 * Math.sin((t / T_SQ) * TAU);
  }
  const rx = R0 / Math.sqrt(1 + s), ry = R0 * (1 + s);
  return { s, by, arm, q, age, rx, ry };
}
const ctr = (P) => [0, P.by - P.ry];

function ball(g, C, P, t) {
  const [cx, cy] = ctr(P);
  const lit = (x, y, k) => Math.hypot(cx - P.rx * 0.4 + (x - cx + P.rx * 0.4) / k, cy - P.ry * 0.42 + (y - cy + P.ry * 0.42) / k) < R0;
  g.clear();
  g.shade(-15, Math.floor(cy - P.ry - 2), 15, 1, (x, y) => {
    const d = Math.hypot((x - cx) / P.rx, (y - cy) / P.ry);
    if (d > 1) return 0;
    let c = lit(x, y, 0.5) ? C[6] : lit(x, y, 0.78) ? C[5] : C[4];
    if (d > 0.86) c = C[3];
    if (y - cy > P.ry * 0.45) c = d > 0.8 ? C[2] : C[3];
    // powder grain on the shaded half
    if (c === C[4] || c === C[3]) {
      const n = Math.sin(x * 2.9) * Math.sin(y * 2.3);
      if (n > 0.55) c = c === C[4] ? C[5] : C[4];
    }
    return c;
  });
  // face: coal eyes, wide in the air, squeezed on the splat, a coal smile
  const ey = Math.round(cy - P.ry * 0.15), ex = Math.round(P.rx * 0.38), COAL = hex("#101018");
  const shut = P.age < 0.14 && P.q < 0, blink = t > 0.5 && t < 0.57;
  for (const s of [-1, 1]) {
    const x = Math.round(cx + s * ex);
    if (shut || blink) g.set(x, ey, COAL), g.set(x + 1, ey, COAL);
    else {
      g.set(x, ey - 1, COAL); g.set(x + 1, ey - 1, COAL);
      g.set(x, ey, COAL); g.set(x + 1, ey, COAL);
      g.set(x + (s < 0 ? 1 : 0), ey - 1, C[6]);
    }
  }
  for (const [dx, dy] of [[-2, 1], [-1, 2], [0, 2], [1, 2], [2, 1]]) if (!shut) g.set(Math.round(cx) + dx, ey + dy + 1, COAL);
  // twig arms flung up on the hop
  for (const s of [-1, 1]) {
    const bx = cx + s * (P.rx - 1), byy = cy + P.ry * 0.15;
    const tipX = bx + s * (3 + P.arm * 2.4), tipY = byy - 3 - P.arm * 3.4;
    g.line(bx, byy, tipX, tipY, hex("#4a2e16"));
    g.line(tipX, tipY, tipX + s * 1.6, tipY - 1.6, hex("#4a2e16"));
  }
  // the ice sprout on its crown: a little crystal that catches light
  const ix = Math.round(cx), iy = Math.round(cy - P.ry);
  g.set(ix, iy - 1, hex("#5cb0e0")); g.set(ix, iy - 2, hex("#b8ecff")); g.set(ix, iy - 3, hex("#b8ecff"));
  g.set(ix - 1, iy - 1, hex("#2a6aa8")); g.set(ix + 1, iy - 1, hex("#5cb0e0"));
  g.outline((x, y, nx, ny) => (ny > 0 ? C[2] : C[3]));
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), I = fit(o.ice, 4), P = pose(t);
  const g = GRID;
  ball(g, C, P, t);
  g.draw(p);
  const [cx, cy] = ctr(P);
  // powder thrown off by the splat
  if (P.age < 0.5 && (t >= T_LAND || t < T_SQ)) {
    for (let i = 0; i < 10; i++) {
      const r = rng(o.seed, i, 61), a = r.range(-0.4, 0.4) + (r.chance(0.5) ? Math.PI : 0), sp = r.range(25, 70);
      const [x, y] = [Math.cos(a) * sp * P.age, -2 + Math.sin(a) * sp * P.age * 0.5 + 60 * P.age * P.age];
      if (y > 1) continue;
      p.dot(x, Math.min(0, y), i % 3 ? C[5] : C[6], clamp(1 - P.age * 2.2));
    }
  }
  // snowflakes drifting down, one melting on its crown
  cycle(t, D, 5, o.seed * 17 + 3, (r) => r.range(2, 3), (ag, L, r, i) => {
    const k = ag / L, x = r.range(-30, 30) + Math.sin(ag * 1.7 + i * 2) * 5, y = -46 + r.range(14, 20) * ag;
    const al = Math.min(1, k * 4) * Math.min(1, (1 - k) * 3);
    p.dot(x, y, C[6], al * 0.8);
    if (i % 2) p.dot(x + 1, y, C[5], al * 0.5);
  });
  const ma = wrap(t - 0.3, D);
  if (ma < 0.7) {
    const k = ma / 0.7, x = cx + Math.sin(ma * 5) * 2, y = cy - P.ry - (1 - k) * 8;
    if (k > 0.75) sparkle(p, cx, cy - P.ry - 2, (k - 0.75) * 16, C[6], C[5], 0.5);
    else p.px(Math.round(x), Math.round(y), C[6]);
  }
  p.glow(cx, cy, P.rx * 2, C[4], 0.12);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), P = pose(t);
  const hgt = clamp(-P.by / 20);
  shadow(p, 0, -0.2, P.rx * (1 - 0.25 * hgt) + 2, 1.6, C[0], 0.5 - 0.25 * hgt);
  // the snow splat it leaves: a white rim that spreads on landing and fades back
  const splat = P.age < 0.9 && (t >= T_LAND || t < T_SQ) ? (1 - P.age / 0.9) : 0;
  if (splat > 0)
    for (let x = -Math.floor(P.rx + splat * 8); x <= P.rx + splat * 8; x++)
      if (Math.abs(x) > 2) p.dot(x, 0, C[5], splat * 0.7 * (1 - Math.abs(x) / (P.rx + splat * 8)));
}
