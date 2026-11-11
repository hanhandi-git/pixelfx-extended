// A scorpion: it holds its claws wide and snaps them, scuttles a step, then lunges with its
// tail whipping over to stab the ground ahead, a bead of venom falling off the stinger.
import { fit, hex, mix, clamp, wrap, lerp, smooth, seg, ease, rng, TAU } from "../../core/index.js";
import { Grid, shift, spring, lnoise, shadow, toss } from "./_lib.js";

export const meta = {
  name: "Scorpion",
  desc: "A scorpion snaps its claws, scuttles a step, then lunges: its tail whips over its head to stab the ground ahead, a bead of venom falling off the stinger.",
  tags: ["critter", "scorpion", "desert", "sting", "menace", "loop"],
  size: [112, 80],
  origin: [56, 70],
  duration: 3.8,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#0e0a12", "#1e1426", "#38204a", "#5a3468", "#8a5290", "#c080b8", "#f0d4f0"],
    sting: ["#38100a", "#8a2c14", "#e05a20", "#ffb040"],
    seed: 1,
  },
};

const D = meta.duration, GRID = new Grid(-20, -26, 40, 30);
const T_SCUT = 1.3, T_LUNGE = 1.75, T_STING = 2.0, T_BACK = 2.9;

// pose: scuttle x, claw open left/right, sting q (0 arched .. 1 stabbed forward), lunge surge
function pose(t) {
  let x = 0, cl = 0, cr = 0, q = 0, surge = 0;
  // claw menace: alternating open-close pulses
  cl = 0.4 + 0.6 * Math.max(0, Math.sin(t * TAU * 2.1));
  cr = 0.4 + 0.6 * Math.max(0, Math.sin(t * TAU * 2.1 + 2.2));
  if (t >= T_SCUT && t < T_LUNGE) x = 4 * ease.inOutSine(seg(t, T_SCUT, T_LUNGE));
  else if (t >= T_LUNGE) {
    x = 4;
    if (t < T_BACK) {
      const u = (t - T_LUNGE) / (T_BACK - T_LUNGE);
      surge = Math.sin(Math.min(1, u * 1.1) * Math.PI);
      x = 4 + 6 * surge * (u < 0.55 ? 1 : 1 - (u - 0.55) * 1.4);
      q = u < 0.5 ? ease.outCubic(u * 2) : Math.max(0, 1 - (u - 0.6) / 0.3);
      cl = 0.2 + surge * 0.8; cr = 0.2 + surge * 0.8; // claws pull back for the stab
    }
    if (t >= T_BACK) {
      const u = seg(t, T_BACK, T_BACK + 0.8);
      x = lerp(6, 0, ease.inOutSine(u));
    }
  }
  const quiver = 0.4 * Math.sin(t * TAU * 7) * (1 - q);
  return { x, cl, cr, q, surge, quiver };
}

// the tail: a chain of segments along an arc over the back; q straightens it into the stab
function tailPts(P) {
  const bx = P.x - 5, st = P.q;
  // arched: tip hovers at (bx+8,-13); stabbed: tip drives to (P.x+13,-3)
  const mx = lerp(bx + 1, P.x + 6, st), my = lerp(-14, -11, st);
  const tx = lerp(bx + 8, P.x + 13.5, st), ty = lerp(-12, -2.2, st);
  const pts = [];
  for (let i = 0; i <= 6; i++) {
    const u = i / 6;
    const x = lerp(lerp(bx, mx, u), lerp(mx, tx, u), u), y = lerp(lerp(-5.5, my, u), lerp(my, ty, u), u);
    pts.push([x, y]);
  }
  return pts;
}

function scorpion(g, C, S, P, t) {
  g.clear();
  // abdomen segments along the ground behind the body
  for (let i = 0; i < 4; i++) {
    const ax = P.x - 4 - i * 2.6, r = 2.4 - i * 0.3;
    g.ellipse(ax, -3.4, r + 0.6, r, (nx, ny) => (ny < -0.4 ? C[4] : ny > 0.4 ? C[1] : C[3]));
  }
  // tail segments + stinger
  const tp = tailPts(P);
  for (let i = 1; i < tp.length; i++) {
    const [tx, ty] = tp[i], r = 1.7 - i * 0.12;
    g.ellipse(tx, ty, r + 0.3, r, (nx, ny) => (ny < -0.3 ? C[5] : ny > 0.4 ? C[1] : C[3]));
  }
  const [stx, sty] = tp[6], [px, py] = tp[5];
  const dx = stx - px, dy = sty - py, dl = Math.hypot(dx, dy) || 1;
  g.line(stx, sty, stx + (dx / dl) * 2.6, sty + (dy / dl) * 2.6 + 0.4, S[2]);
  g.set(stx + (dx / dl) * 2.6, sty + (dy / dl) * 2.6 + 0.4, S[3]);
  // the body: a low shield carapace
  g.shade(P.x - 9, -9, P.x + 8, -1, (x, y) => {
    const d = ((x - P.x) / 8.4) ** 2 + ((y + 5) / 3.8) ** 2;
    if (d > 1) return 0;
    if (d > 0.8) return C[2];
    if (Math.abs(x - P.x) < 0.7) return C[1]; // the mid seam
    return y < -5.4 ? C[5] : y > -2.6 ? C[1] : C[3];
  });
  // claws: arm + a two-lobed pincer that opens and shuts
  for (const s of [-1, 1]) {
    const open = s > 0 ? P.cr : P.cl, near = s > 0;
    const ax = P.x + 4 + s * 1.4, ay = -5.4;
    const cx = ax + 4.6 + s * 0.6, cy = ay - 1.4 - (near ? 0 : 0.4);
    g.line(ax, ay, (ax + cx) / 2 + s * 0.8, ay - 1, near ? C[3] : C[2]);
    g.line((ax + cx) / 2 + s * 0.8, ay - 1, cx, cy, near ? C[3] : C[2]);
    // pincer: palm + two fingers, gap grows with open
    g.ellipse(cx + s * 1.6, cy - 0.4, 2.2, 1.9, (nx, ny) => (ny < -0.3 ? C[4] : C[3]));
    const gap = 0.5 + open * 2;
    g.line(cx + s * 2.4, cy - 1, cx + s * 4.6, cy - gap - 0.6, near ? C[5] : C[3]);
    g.line(cx + s * 2.4, cy + 0.4, cx + s * 4.2, cy + gap * 0.5, near ? C[4] : C[3]);
  }
  // legs: four pairs stepping, hind pair pressing the floor during the lunge
  const step = t >= T_SCUT && t < T_LUNGE ? seg(t, T_SCUT, T_LUNGE) * 2 : 0;
  for (const s of [-1, 1])
    for (let l = 0; l < 4; l++) {
      const lx = P.x - 5 + l * 3, sw = Math.sin(step * Math.PI * 2 + l * 1.3 + (s < 0 ? Math.PI : 0));
      const drag = P.surge * 2;
      g.line(lx, -4.2, lx + s * 2.2 + sw * s - drag * 0.4, -2.4, s > 0 ? C[2] : C[1]);
      g.line(lx + s * 2.2 + sw * s - drag * 0.4, -2.4, lx + s * 3.4 + sw * s * 1.4 - drag, -0.4, s > 0 ? C[2] : C[1]);
    }
  // eyes: two beads on the front rim, glowing when it lunges
  g.set(P.x + 7, -6.4, P.surge > 0.4 ? S[3] : C[6]);
  g.set(P.x + 6, -5.4, C[1]);
  g.outline(C[0]);
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), S = fit(o.sting, 4), P = pose(t);
  const g = GRID;
  scorpion(g, C, S, P, t);
  g.draw(p);
  const tp = tailPts(P), [stx, sty] = tp[6];
  // the stinger glows hottest as it whips
  p.glow(stx, sty, 5, S[3], 0.25 + P.q * 0.4);
  // a bead of venom on the tip after the stab, falling and hissing on the floor
  const va = wrap(t - (T_STING + 0.25), D);
  if (va > 0 && va < 1.1) {
    const f = toss(stx, sty + 1, 1, 0, va, 320, -1);
    if (!f.landed) p.px(f.x, f.y, S[3]), p.px(f.x, f.y - 1, S[2]);
    else if (va - f.at < 0.6) {
      const k = (va - f.at) / 0.6;
      p.disc(f.x, -0.5, 1.2 + k * 2.4, S[2], (1 - k) * 0.5);
      p.glow(f.x, -1, 4, S[3], 0.3 * (1 - k));
    }
  }
  // dust off the lunge and the scuttle
  for (const [t0, n, pw] of [[T_SCUT, 5, 0.5], [T_LUNGE, 10, 1]]) {
    const a2 = wrap(t - t0, D);
    if (a2 > 0.7) continue;
    for (let i = 0; i < n; i++) {
      const r = rng(o.seed, i, t0 * 91), sgn = r.sign();
      p.dot(P.x + sgn * (5 + r.range(6, 20) * a2 * 2.6), -1 - r.range(0, 3) * a2, C[2], clamp(1.1 - a2 * 1.8) * pw);
    }
  }
  p.glow(P.x, -6, 22, C[4], 0.08);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), P = pose(t);
  shadow(p, P.x - 2, -0.2, 11, 1.6, C[0], 0.55);
}
