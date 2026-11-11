import { fit, hex, seg, lerp, burst } from "../../core/index.js";
import { glint, sparks, chunks, dustPuff, hitStar, ribbon, WHITE } from "./_attack.js";

export const meta = {
  name: "Ember Imp Rake",
  desc: "余烬小鬼的爪击：双爪后撩蓄势，两道火星爪痕交叉撕过，命中点迸出煤屑与火花.",
  tags: ["mob", "attack", "imp", "ember", "fantasy", "melee", "claw", "one-shot"],
  kind: "mob-attack",
  size: [112, 72],
  origin: [16, 60],
  duration: 0.7,
  loop: false,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#1a0c12", "#3a1420", "#6a2430", "#a84848", "#d87858", "#f8b080", "#ffe0b0", "#fff8dc"],
    seed: 1,
  },
};

export const attack = {
  telegraph: 0.22,
  hits: [{ t: 0.34, amp: 1.1, shake: 0.1, damage: 7, range: 30, target: "hero" }],
  pose: { cast: "slash", windup: 0.22, hold: 0.08, recover: 0.3 },
};

const D = meta.duration, HIT = attack.hits[0].t;
const COAL = ["#1a0c08", "#3a140c", "#6a2410", "#a83c14", "#e0681e", "#ff9a3c", "#ffd88a", "#fff4c8"];

function clawArc(p, C, u, k) {
  // two crossing rake arcs: ember-orange ribbons with white-hot tips
  const A = [-6, -34], B = [34, -18], Cc = [14, -44];
  ribbon(p, [A[0], A[1]], [Cc[0], Cc[1]], [B[0], B[1]], 3.2 * k, (v) => v < 0.5 ? C[4] : C[5], 0.85 * k);
  const A2 = [8, -30], B2 = [38, -26], C2 = [20, -40];
  ribbon(p, [A2[0], A2[1]], [C2[0], C2[1]], [B2[0], B2[1]], 2.4 * k, (v) => v < 0.5 ? C[3] : C[4], 0.7 * k);
  if (k > 0.4) {
    p.circle(B[0], B[1], 2, WHITE, (k - 0.4) * 1.4);
    p.glow(B[0], B[1], 8, C[5], 0.3 * k);
  }
}

export function draw(p, time, o) {
  if (time >= D) return;
  const t = time, C = fit(o.palette, 8), seed = o.seed ?? 1;
  if (t < HIT) {
    const k = seg(t, 0.04, HIT);
    // tell: both claws glow and a dotted floor line finds the hero
    glint(p, -4, -30, 0.4 + k * 0.8, C[5], WHITE);
    glint(p, 8, -28, 0.3 + k * 0.6, C[4]);
    dotted(p, [-4, -26], [30, -14], C[4], 0.2 + k * 0.2);
    clawArc(p, C, t, 0.35 + k * 0.45);
  }
  if (t >= HIT) {
    const q = seg(t, HIT, 0.62), kk = 1 - q;
    hitStar(p, 30, -20, 7 + q * 3, C, kk);
    sparks(p, 30, -20, t - HIT, seed, C, 8, 1.1, 0.3);
    chunks(p, 30, -14, t - HIT, seed + 3, C, 7, 0.9, 0.5);
    dustPuff(p, 30, -4, t - HIT, seed + 5, hex("#4a3428"), 7, 1.1);
    for (let i = 0; i < 4; i++) {
      const a = -Math.PI * (0.7 + i * 0.18);
      p.line(30 + Math.cos(a) * 4, -20 + Math.sin(a) * 4, 30 + Math.cos(a) * (10 + i * 3), -20 + Math.sin(a) * (10 + i * 3), i % 2 ? C[5] : C[6], kk * 0.8);
    }
    p.glow(30, -18, 14 * kk + 4, C[4], 0.3 * kk);
  }
}

function dotted(p, a, b, c, alpha) {
  const n = 8;
  for (let i = 1; i < n; i++) {
    const u = i / n;
    p.dot(lerp(a[0], b[0], u), lerp(a[1], b[1], u), c, alpha);
  }
}
