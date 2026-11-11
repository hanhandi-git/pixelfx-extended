// A frost moth orbiting a small floating ice crystal: wingbeats in bursts, glides on spread
// rimed wings, frost scales sifting down off its wings and catching the light.
import { fit, hex, mix, clamp, wrap, lerp, smooth, seg, ease, rng, cycle, sparkle, TAU } from "../../core/index.js";
import { Grid, shift, lnoise, shadow } from "./_lib.js";

export const meta = {
  name: "Frost moth",
  desc: "A frost moth circles a floating ice crystal in bursts of wingbeats and rimed-wing glides, sifting frost scales that twinkle as they settle.",
  tags: ["critter", "moth", "ice", "winter", "insect", "flying", "loop"],
  size: [112, 104],
  origin: [56, 96],
  duration: 3.6,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#0c1420", "#16283e", "#264a68", "#3e74a0", "#66a4cc", "#a8d4ec", "#eafaff"],
    ice: ["#0e2a44", "#2a6aa8", "#5cb0e0", "#b8ecff"],
    hover: 44,
    seed: 1,
  },
};

const D = meta.duration, GRID = new Grid(-16, -16, 32, 22);
// the moth's circuit around the crystal at (0, -hover): an inclined ellipse, with a dip
// toward the crystal once a loop
function at(t, hover) {
  const a = (t / D) * TAU;
  const dip = Math.max(0, Math.sin(a - Math.PI * 0.5)) ** 2;
  return {
    x: 26 * Math.sin(a),
    y: -hover - 8 * Math.sin(2 * a) - dip * 7,
    vx: ((26 * TAU) / D) * Math.cos(a),
    vy: ((-16 * TAU) / D) * Math.cos(2 * a) - ((7 * TAU) / D) * Math.sin(2 * (a - Math.PI * 0.5)) * Math.max(0, Math.sin(a - Math.PI * 0.5)),
    a,
    dip,
  };
}
// wingbeat bursts: flapping while it climbs, gliding when it descends
const flapAt = (t) => smooth(-0.1, 0.35, Math.sin((t / D) * TAU * 2 + 1.2));

function moth(g, C, S, t, flap) {
  g.clear();
  const lean = clamp(-S.vx / 90, -0.8, 0.8);
  const wing = Math.sin(t * TAU * 9) * flap;
  // each wing: a broad rimed blade swept back with the flight direction
  for (const s of [-1, 1]) {
    const lift = 2.6 + wing * 3.4 * s;
    const spread = 1 + flap * 0.12;
    const pts = [];
    // wing outline: root at the thorax, swept blade
    for (const [wx, wy] of [[s * 1.5, -1], [s * 8 * spread, -3 - lift], [s * 12.5 * spread, -1 - lift * 0.7], [s * 10 * spread, 1.5 - lift * 0.4], [s * 4 * spread, 1.2]])
      pts.push([wx + lean * (wy + 4) * 0.5, wy]);
    g.poly(pts, (x, y) => {
      const u = Math.abs(x) / 12;
      const rim = y < -1 - lift * 0.55;
      if (u > 0.85 || rim) return C[6]; // rime at the edges
      const vein = Math.abs(((x * s + 40) % 3.4) - 1.7) < 0.5;
      return vein ? C[3] : y > 0.4 ? C[4] : C[5];
    }, 0.92);
  }
  // the body: a fuzzy thorax, a tapering abdomen, antennae
  g.shade(-3, -4, 3, 7, (x, y) => {
    if (Math.abs(x) < 1.8 && y > -3 && y < 1.4) return C[4]; // thorax
    if (Math.abs(x) < lerp(1.2, 0.2, Math.max(0, y - 1) / 5) && y >= 1 && y < 6) return y < 2.6 ? C[3] : C[4]; // abdomen
    return 0;
  });
  for (const s of [-1, 1]) g.line(s * 0.8, -3, s * 2.6, -5.5 - flap * 0.5, C[5]);
  // eyes
  g.set(-1, -2.6, C[6]); g.set(0, -2.6, C[6]);
  g.outline(C[0]);
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), I = fit(o.ice, 4), S = at(t, o.hover), flap = flapAt(t);
  const g = GRID;
  moth(g, C, S, t, flap);
  g.draw(p, 1, Math.round(S.x), Math.round(S.y));
  // frost scales sifted off the wings, twinkling as they drift down
  cycle(t, D, 16, o.seed * 13 + 5, (r) => r.range(1.4, 2.4), (ag, L, r, i) => {
    const S0 = at(wrap(t - ag, D), o.hover), k = ag / L;
    const x = S0.x + r.range(-8, 8) + Math.sin(ag * 3 + i) * 2, y = S0.y + r.range(-2, 4) + ag * r.range(4, 9);
    const al = Math.min(1, k * 5) * Math.min(1, (1 - k) * 2.5);
    const tw = Math.sin(ag * 11 + i * 2.7);
    p.dot(x, y, tw > 0.4 ? C[6] : C[5], al * (0.4 + 0.6 * Math.abs(tw)));
    if (tw > 0.85) p.glow(x, y, 4, C[5], 0.3 * al);
  });
  // the crystal it circles: a hovering shard, slowly turning, lit core, glint
  const cy = -o.hover - 4, spin = (t / D) * TAU;
  const cw = 3.4 + Math.sin(spin * 2) * 0.8;
  p.shade(-6, cy - 9, 6, cy + 9, (x, y) => {
    const v = (y - cy) / 8;
    if (Math.abs(x) > cw * (1 - Math.abs(v) ** 1.5)) return;
    const d = Math.abs(x) / (cw * (1 - Math.abs(v) ** 1.5));
    p.px(x, y, d < 0.4 ? I[3] : d < 0.75 ? I[2] : I[1]);
  });
  p.px(-1, cy - 5, I[3]);
  const glint = Math.sin(spin * 2 - 0.6);
  if (glint > 0.6) sparkle(p, 0, cy - 7, 2 + glint * 2.5, I[3], I[2], 0.4 * glint);
  p.glow(0, cy, 20, I[2], 0.22 + 0.06 * Math.sin(spin * 2));
  p.glow(S.x, S.y, 18, C[4], 0.14);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), I = fit(o.ice, 4), S = at(t, o.hover);
  shadow(p, S.x, -0.2, 6, 1.2, C[0], 0.3 * clamp(1 - (-S.y - 30) / 40));
  p.glow(0, -1, 24, I[2], 0.08);
  // scales that settled on the floor glint now and then
  for (let i = 0; i < 5; i++) {
    const r = rng(o.seed, i, 99), k = Math.sin((t / D) * TAU * 3 + r.next() * TAU);
    if (k > 0.7) p.dot(r.range(-26, 26), 0, C[5], (k - 0.7) * 2);
  }
}
