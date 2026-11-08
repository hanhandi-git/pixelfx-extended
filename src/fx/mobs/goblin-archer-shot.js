import { fit, hex, seg, lerp, burst } from "../../core/index.js";
import { glint, sparks, chunks, dustPuff, hitStar, WHITE } from "./_attack.js";

export const meta = {
  name: "Goblin Archer Shot",
  desc: "哥布林弓箭手的短弓射击：搭箭屏息，一道白线钉进目标，箭杆震颤、木屑与尘土从命中点炸开.",
  tags: ["mob", "attack", "goblin", "fantasy", "ranged", "projectile", "one-shot"],
  kind: "mob-attack",
  size: [112, 72],
  origin: [16, 60],
  duration: 0.72,
  loop: false,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#161006", "#332310", "#5a421c", "#8a6a2e", "#c0a050", "#f0d888", "#fff8d0", "#ffffff"],
    seed: 1,
  },
};

export const attack = {
  telegraph: 0.3,
  hits: [{ t: 0.38, amp: 1.2, shake: 0.1, damage: 6, range: 40, target: "hero" }],

  // how the body sells it: wind up through the tell, release on the hit, then recover
  pose: { cast: "shoot", windup: 0.3, hold: 0.08, recover: 0.28 },
};

const D = meta.duration, HIT = attack.hits[0].t;
const NOCK = [16, -27], TARGET = [46, -26], STEEL = hex("#c8d0d8");

export function draw(p, time, o) {
  if (time >= D) return;
  const t = time, C = fit(o.palette, 8), seed = o.seed ?? 1;
  // --- the tell: the nock glints, a dotted line finds the gap, the target answers
  if (t < HIT) {
    const k = seg(t, 0.02, 0.3);
    dotted(p, [18, -27], TARGET, C[4], 0.22 + k * 0.16);
    glint(p, NOCK[0], NOCK[1], 0.3 + k * 0.7, C[5], WHITE);
    if (k > 0.4) glint(p, TARGET[0], TARGET[1], (k - 0.4) * 0.8, C[4]);
    // the bow bends: two tension lines at the nock
    p.line(14, -30, 12, -26, C[3], 0.35 * k);
    p.line(14, -24, 12, -28, C[3], 0.35 * k);
    p.disc(2, 0, 5, C[1], 0.12 * k);
  }
  // --- release: three frames of arrow, a hard white sputter at the bow
  if (t >= 0.3 && t < HIT) {
    const u = seg(t, 0.3, HIT);
    const x = lerp(NOCK[0], TARGET[0], u), y = -26;
    arrow(p, x, y, 1, C);
    for (let i = 0; i < 3; i++) p.line(x - 10 - i * 3, y - 3 + i * 3, x - 6 - i * 3, y - 3 + i * 3, C[5], 0.4);
    if (u < 0.4) {
      p.circle(NOCK[0] + 2, -26, 2.5, WHITE, 0.9 * (1 - u * 2.5));
      p.glow(NOCK[0] + 2, -26, 10, C[4], 0.3 * (1 - u * 2.5));
      p.ring(NOCK[0] + 2, -26, 5 + u * 18, 1, C[5], 0.4 * (1 - u * 3));
    }
  }
  // --- impact: star, splinters, a dust kick at the floor and the arrow shivering in place
  if (t >= HIT) {
    const q = seg(t, HIT, 0.66), kk = 1 - q;
    const shake = Math.sin(t * 90) * (1 - q) * 1.6;
    hitStar(p, TARGET[0], TARGET[1], 4.6 * (0.55 + kk * 0.45), C, kk);
    // the arrow stands in the hit, quivering
    if (q < 0.7) {
      p.line(TARGET[0] - 1 + shake, TARGET[1] + 1, TARGET[0] - 7 + shake, TARGET[1] + 2, C[4], 0.9 * kk);
      p.line(TARGET[0] - 6 + shake, TARGET[1] + 1, TARGET[0] - 8 + shake, TARGET[1] + 2, C[2], 0.8 * kk);
    }
    chunks(p, TARGET[0], TARGET[1], t - HIT, seed + 5, C, 9, 0.9, 0.34);
    sparks(p, TARGET[0], TARGET[1], t - HIT, seed + 9, C, 7, 0.9, 0.26);
    dustPuff(p, TARGET[0] - 2, 0, t - HIT, seed + 17, C[2], 8, 1.0, 0.3);
    p.glow(TARGET[0], TARGET[1], 14, C[4], 0.2 * kk);
    p.ring(TARGET[0], TARGET[1], 4 + q * 10, 1, C[5], 0.35 * kk);
  }
}

export function drawBack(p, time, o) {
  if (time >= D) return;
  const C = fit(o.palette, 8), k = seg(time, 0.18, 0.34);
  if (k > 0) p.dot(TARGET[0], 0, C[5], 0.3 * k);
}

function arrow(p, x, y, a, C) {
  // 8 px shaft, a steel head, a red fletching that trails the nock
  p.line(x - 8, y, x + 4, y, C[4], a);
  p.line(x - 8, y + 0.6, x + 4, y + 0.6, C[2], a * 0.8);
  p.px(x + 5, y, STEEL);
  p.px(x + 6, y, WHITE);
  p.line(x - 8, y - 1.4, x - 5, y - 2.0, C[5], a);
  p.line(x - 8, y + 1.4, x - 5, y + 2.0, C[5], a);
  p.px(x - 9, y - 1, C[5]);
  p.px(x - 9, y + 1, C[5]);
}

function dotted(p, a, b, c, al) {
  const n = 14;
  for (let i = 1; i < n; i++) {
    const u = i / n;
    p.dot(lerp(a[0], b[0], u), lerp(a[1], b[1], u), c, al);
  }
}
