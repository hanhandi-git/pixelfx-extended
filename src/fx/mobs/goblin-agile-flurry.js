import { fit, hex, seg } from "../../core/index.js";
import { ribbon, glint, sparks, hitStar, WHITE } from "./_attack.js";

export const meta = {
  name: "Goblin Agile Flurry",
  desc: "敏捷哥布林的双匕连刺：两下短促的寒光在胸前交叉成 X，第一刀轻、第二刀重，火星与残光收得很快.",
  tags: ["mob", "attack", "goblin", "fantasy", "assassin", "melee", "one-shot"],
  kind: "mob-attack",
  size: [112, 72],
  origin: [16, 60],
  duration: 0.7,
  loop: false,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#08141a", "#0e2c38", "#165060", "#247a8a", "#48b0b8", "#98e8e0", "#e8fffa", "#ffffff"],
    seed: 1,
  },
};

export const attack = {
  telegraph: 0.16,
  hits: [
    { t: 0.22, amp: 1.0, shake: 0.1, damage: 4, range: 18, target: "hero" },
    { t: 0.34, amp: 1.7, shake: 0.16, damage: 5, range: 18, target: "hero" },
  ],

  // how the body sells it: wind up through the tell, release on the hit, then recover
  pose: { cast: "flurry", windup: 0.16, hold: 0.18, recover: 0.3 },
};

const D = meta.duration, H1 = attack.hits[0].t, H2 = attack.hits[1].t;
const A1 = [[12, -29], [30, -25], [34, -9]], A2 = [[12, -9], [29, -11], [37, -29]];

export function draw(p, time, o) {
  if (time >= D) return;
  const t = time, C = fit(o.palette, 8), seed = o.seed ?? 1;
  // --- the tell: two dagger glints, a faint X drawn in the air, a scuff of dust
  if (t < H1) {
    const k = seg(t, 0.01, 0.16);
    glint(p, 9, -20, 0.2 + k * 0.7, C[5], WHITE);
    glint(p, 6, -17, 0.15 + k * 0.6, C[4], WHITE);
    p.line(13, -28, 30, -10, C[2], 0.12 * k);
    p.line(13, -10, 30, -28, C[2], 0.12 * k);
    p.disc(2, 0, 5, C[1], 0.12 * k);
  }
  // --- first cut
  const f1 = 1 - seg(t, H1, H1 + 0.16);
  if (t >= H1 - 0.02 && f1 > 0) {
    ribbon(p, A1[0], A1[1], A1[2], 2.6, () => C[3], 0.42 * f1);
    ribbon(p, A1[0], A1[1], A1[2], 1.5, () => C[5], 0.9 * f1);
    ribbon(p, A1[0], A1[1], A1[2], 0.6, () => WHITE, f1);
    sparks(p, 31, -16, t - H1, seed + 3, C, 6, 0.8, 0.22);
  }
  if (t >= H1 && t < H1 + 0.1) hitStar(p, 31, -16, 3.8, C, 1 - seg(t, H1, H1 + 0.1));
  // --- second cut, a heavier cross
  const f2 = 1 - seg(t, H2, H2 + 0.2);
  if (t >= H2 - 0.02 && f2 > 0) {
    ribbon(p, A2[0], A2[1], A2[2], 3.4, () => C[3], 0.42 * f2);
    ribbon(p, A2[0], A2[1], A2[2], 2.0, () => C[4], 0.9 * f2);
    ribbon(p, A2[0], A2[1], A2[2], 0.8, () => WHITE, f2);
    sparks(p, 34, -19, t - H2, seed + 7, C, 9, 1.1, 0.26);
    p.glow(34, -19, 14, C[4], 0.2 * f2);
  }
  if (t >= H2 && t < H2 + 0.14) hitStar(p, 34, -19, 5.0, C, 1 - seg(t, H2, H2 + 0.14));
  // --- the X afterglow lingers briefly
  const xg = t > H1 ? 1 - seg(t, H1 + 0.02, 0.58) : 0;
  if (xg > 0) {
    p.line(14, -27, 33, -11, C[3], 0.18 * xg);
    p.line(14, -11, 34, -27, C[3], 0.13 * xg);
  }
}

export function drawBack(p, time, o) {
  if (time >= D) return;
  const C = fit(o.palette, 8), k = seg(time, 0.05, 0.2);
  if (k > 0) p.disc(2, 0, 6, C[1], 0.14 * k);
}
