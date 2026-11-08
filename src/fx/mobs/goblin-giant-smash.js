import { fit, hex, seg, burst, fly, TAU } from "../../core/index.js";
import { chunks, dustPuff, sparks, hitStar, groundEllipse, groundRing, WHITE } from "./_attack.js";

export const meta = {
  name: "Goblin Giant Quake",
  desc: "巨人哥布林的踏地重击：地面阴影先压下来，脚落时白闪、地裂、碎石与尘浪向四周推开，余尘久久不散.",
  tags: ["mob", "attack", "goblin", "fantasy", "brute", "one-shot"],
  kind: "mob-attack",
  size: [128, 80],
  origin: [20, 66],
  duration: 1.25,
  loop: false,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#140e08", "#2e1e12", "#4e3418", "#6e4a24", "#946a38", "#bd9058", "#e2c48e", "#fff0c8"],
    seed: 1,
  },
};

export const attack = {
  telegraph: 0.62,
  hits: [{ t: 0.74, amp: 3.4, shake: 0.42, damage: 22, range: 30, target: "hero" }],

  // how the body sells it: wind up through the tell, release on the hit, then recover
  pose: { cast: "quake", windup: 0.62, hold: 0.12, recover: 0.4 },
};

const D = meta.duration, HIT = attack.hits[0].t, IMPACT = [36, 0];
const ROCK = ["#24201c", "#3e3830", "#5c5448", "#7c7262", "#a09480"].map(hex);

export function draw(p, time, o) {
  if (time >= D) return;
  const t = time, C = fit(o.palette, 8), seed = o.seed ?? 1;
  // --- the tell: a shadow compresses the floor, dust gathers around the feet
  if (t < HIT) {
    const g = seg(t, 0.06, HIT);
    groundEllipse(p, IMPACT[0], 0, 3 + g * 14, (3 + g * 14) * 0.28, C[0], 0.14 + g * 0.18);
    groundRing(p, IMPACT[0], 8 + g * 9, C[5], 0.2 + g * 0.2);
    dustPuff(p, 5, 0, Math.max(0, t - 0.12), seed + 3, C[3], 5, 0.7, 0.3);

  }
  // --- the hit: one white frame, a hard star, a ring that runs out along the floor
  if (t >= HIT && t < HIT + 0.06) {
    const k = 1 - seg(t, HIT, HIT + 0.06);
    p.disc(IMPACT[0], -2, 9, WHITE, 0.3 * k);
    p.circle(IMPACT[0], -2, 3.2, WHITE, 1);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU + 0.1, len = (i % 2 ? 9 : 15) * (0.6 + k * 0.4);
      p.line(IMPACT[0] + Math.cos(a) * 2, -2 + Math.sin(a) * 2, IMPACT[0] + Math.cos(a) * len, -2 + Math.sin(a) * len * 0.8, i % 2 ? C[6] : WHITE, 0.9);
    }
    p.glow(IMPACT[0], -2, 28, C[6], 0.42 * k);
  }
  if (t >= HIT) {
    const q = seg(t, HIT, HIT + 0.3), kk = 1 - q;
    hitStar(p, IMPACT[0], -4, 6.5 * (0.5 + kk * 0.5), C, kk);
    groundRing(p, IMPACT[0], 6 + seg(t, HIT, HIT + 0.36) * 28, C[5], 0.55 * (1 - seg(t, HIT, HIT + 0.36)));
    groundEllipse(p, IMPACT[0], 0, 10 + q * 12, 3 + q * 3, C[4], 0.22 * kk);
    chunks(p, IMPACT[0], -3, t - HIT, seed + 7, ROCK, 16, 1.6, 0.5);
    sparks(p, IMPACT[0], -4, t - HIT, seed + 13, C, 10, 1.5, 0.35);
    dustPuff(p, IMPACT[0], 0, t - HIT, seed + 19, C[4], 14, 1.9, 0.46);
    dustPuff(p, IMPACT[0] - 7, 0, t - HIT - 0.03, seed + 23, C[3], 10, 1.5, 0.42);
    dustPuff(p, IMPACT[0] + 8, 0, t - HIT - 0.05, seed + 29, C[3], 8, 1.4, 0.38);
    // a short column of dust lifts off the crack
    for (let i = 0; i < 3; i++) {
      const a = Math.max(0, kk - i * 0.18);
      if (a > 0) p.disc(IMPACT[0] + i * 2 - 2, -5 - i * 5, 4 + i * 2, C[3], 0.22 * a);
    }
    p.glow(IMPACT[0], 0, 32, C[4], 0.18 * (1 - seg(t, HIT, 1.0)));
  }
  // --- grit settling
  if (t > HIT + 0.34 && t < HIT + 0.7) {
    const age = t - HIT - 0.34;
    burst(6, seed + 37, (r) => {
      const [dx, dy] = fly(r.range(-22, 20), -2, r.range(-6, 6), r.range(-18, -4), age, 60, 0.4);
      if (dy > 0) return;
      p.dot(IMPACT[0] + dx, dy, ROCK[2 + Math.floor(r.range(0, 2.99))], Math.max(0, 1 - age / 0.35));
    });
  }
}

export function drawBack(p, time, o) {
  if (time >= D) return;
  const C = fit(o.palette, 8);
  // the cracks stay on the floor after the hit
  if (time >= HIT) {
    const k = 1 - seg(time, HIT + 0.1, HIT + 0.55);
    if (k > 0) {
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU + 0.15, L = 10 + (i % 3) * 6;
        let x = IMPACT[0], y = 0;
        for (let d = 1; d <= L; d += 2) {
          const wob = Math.sin(d * 1.7 + i) * 1.1;
          const nx = IMPACT[0] + Math.cos(a) * d + wob, ny = Math.sin(a) * d * 0.28;
          p.line(x, y, nx, ny, i % 2 ? C[0] : C[1], 0.6 * k);
          x = nx; y = ny;
        }
      }
    }
  }
}
