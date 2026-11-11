import { fit, hex, seg, lerp } from "../../core/index.js";
import { glint, sparks, chunks, dustPuff, hitStar, WHITE } from "./_attack.js";

export const meta = {
  name: "Cinder Spit",
  desc: "熔吐者的火球：鼓腮蓄焰，吐出一颗拖着火尾的煤球，命中点炸开一团火星.",
  tags: ["mob", "attack", "imp", "ember", "fantasy", "ranged", "projectile", "one-shot"],
  kind: "mob-attack",
  size: [112, 72],
  origin: [16, 60],
  duration: 0.78,
  loop: false,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#140a06", "#341408", "#5a2410", "#8a3c14", "#c05a1c", "#f08a30", "#ffbe5a", "#ffe9a0"],
    seed: 1,
  },
};

export const attack = {
  telegraph: 0.3,
  hits: [{ t: 0.44, amp: 1.0, shake: 0.09, damage: 8, range: 44, target: "hero" }],
  pose: { cast: "spell", windup: 0.3, hold: 0.1, recover: 0.3 },
};

const D = meta.duration, HIT = attack.hits[0].t;
const FROM = [18, -30], TO = [62, -34];

function fireball(p, C, x, y, k) {
  // layered coal ball: dark rim, orange body, white heart, short tail
  p.circle(x, y, 3.4 * k + 0.6, C[2], 0.9);
  p.circle(x, y, 2.6 * k + 0.4, C[4], 0.95);
  p.circle(x - 0.5, y - 0.5, 1.7 * k, C[5], 0.95);
  p.circle(x - 0.8, y - 0.9, 0.9 * k, C[6]);
  for (let i = 1; i <= 4; i++) {
    const tx = x - i * 3 * k, ty = y + Math.sin(i * 1.7) * 1.4 * k;
    p.dot(tx, ty, i < 3 ? C[4] : C[3], (1 - i / 5) * 0.7);
    if (i < 3) p.dot(tx, ty - 1, C[5], (1 - i / 5) * 0.4);
  }
  p.glow(x, y, 9 * k + 3, C[4], 0.3 * k);
}

export function draw(p, time, o) {
  if (time >= D) return;
  const t = time, C = fit(o.palette, 8), seed = o.seed ?? 1;
  if (t < HIT) {
    const u = seg(t, 0.06, HIT);
    // tell: the maw glows, a dotted line arcs toward the hero
    glint(p, FROM[0], FROM[1], 0.4 + u * 0.9, C[5], WHITE);
    for (let i = 1; i < 9; i++) {
      const v = i / 9;
      const x = lerp(FROM[0], TO[0], v), y = lerp(FROM[1], TO[1], v) - Math.sin(v * Math.PI) * 6;
      p.dot(x, y, C[4], 0.18 + u * 0.2);
    }
    fireball(p, C, FROM[0] + 2, FROM[1], 0.5 + u * 0.6);
    const u2 = seg(t, 0.3, HIT);
    if (u2 > 0) fireball(p, C, lerp(FROM[0], TO[0], u2), lerp(FROM[1], TO[1], u2) - Math.sin(u2 * Math.PI) * 6, 1);
  }
  if (t >= HIT) {
    const q = seg(t, HIT, 0.6), kk = 1 - q;
    hitStar(p, TO[0], TO[1], 6 + q * 4, C, kk);
    sparks(p, TO[0], TO[1], t - HIT, seed, C, 8, 0.7, 0.3);
    chunks(p, TO[0], TO[1] + 4, t - HIT, seed + 2, C, 5, 0.6, 0.45);
    dustPuff(p, TO[0], TO[1] + 8, t - HIT, seed + 4, hex("#3a2a20"), 6, 1);
    p.glow(TO[0], TO[1], 12 * kk + 3, C[4], 0.32 * kk);
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI * (0.6 + i * 0.2);
      p.line(TO[0] + Math.cos(a) * 3, TO[1] + Math.sin(a) * 3, TO[0] + Math.cos(a) * (9 + i * 2), TO[1] + Math.sin(a) * (9 + i * 2), i % 2 ? C[5] : C[6], kk * 0.8);
    }
  }
}
