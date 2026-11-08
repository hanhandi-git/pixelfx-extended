import { fit, hex, seg, ease, lerp, burst, fly, TAU } from "../../core/index.js";
import { glint, sparks, hitStar, groundEllipse, groundRing, WHITE } from "./_attack.js";

export const meta = {
  name: "Goblin Mage Bolt",
  desc: "哥布林法师的奥术弹：杖顶符文收束成球，紫光沿瞄准线飞出，在目标胸口炸成符文环与四散光尘.",
  tags: ["mob", "attack", "goblin", "fantasy", "caster", "projectile", "one-shot"],
  kind: "mob-attack",
  size: [112, 72],
  origin: [16, 60],
  duration: 0.95,
  loop: false,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#120726", "#2a1050", "#4a1c88", "#6e2ec0", "#9a52ec", "#c48cff", "#e8ccff", "#ffffff"],
    seed: 1,
  },
};

export const attack = {
  telegraph: 0.5,
  hits: [{ t: 0.62, amp: 1.6, shake: 0.16, damage: 7, range: 34, target: "hero" }],

  // how the body sells it: wind up through the tell, release on the hit, then recover
  pose: { cast: "spell", windup: 0.5, hold: 0.12, recover: 0.3 },
};

const D = meta.duration, HIT = attack.hits[0].t;
const STAFF = [13, -47], TARGET = [42, -25];

export function draw(p, time, o) {
  if (time >= D) return;
  const t = time, C = fit(o.palette, 8), seed = o.seed ?? 1;
  // --- charge: runes spiral into the staff, a dotted aim line finds the target
  const k = seg(t, 0.02, 0.5);
  if (t < 0.5) {
    dotted(p, [16, -44], TARGET, C[3], 0.24 + k * 0.24);
    p.ring(STAFF[0], STAFF[1], 5.5 + k * 2.5, 1, C[3], 0.35 + k * 0.35);
    for (let i = 0; i < 4; i++) {
      const a = P0(t) * 1.6 + (i / 4) * TAU;
      p.line(STAFF[0] + Math.cos(a) * (6 + k * 3), STAFF[1] + Math.sin(a) * (6 + k * 3) * 0.8, STAFF[0] + Math.cos(a) * (8 + k * 3), STAFF[1] + Math.sin(a) * (8 + k * 3) * 0.8, C[4], 0.5 + k * 0.3);
    }
    for (let i = 0; i < 5; i++) {
      const a = P0(t) * 1.6 + (i / 5) * TAU, r = 10 - k * 6.5;
      p.dot(STAFF[0] + Math.cos(a) * r, STAFF[1] + Math.sin(a) * r * 0.75, C[3], 0.25 + k * 0.5);
    }
    p.disc(STAFF[0], STAFF[1], 2.2 + k * 2.2, C[2], 0.55 + k * 0.25);
    p.circle(STAFF[0], STAFF[1], 1.4 + k * 1.1, C[4], 0.9);
    glint(p, STAFF[0], STAFF[1], 0.2 + k * 0.8, C[5]);
    if (k > 0.35) glint(p, TARGET[0], TARGET[1], (k - 0.35) * 0.9, C[4]);
    burst(5, seed + 13, (r) => {
      const a = r.range(0, TAU), d = (1 - k) * 9 + 2;
      p.dot(STAFF[0] + Math.cos(a) * d, STAFF[1] + Math.sin(a) * d * 0.7, C[4], 0.45 * k);
    });
  }
  // --- flight: the orb crosses the gap in three frames, dragging a trail
  if (t >= 0.48 && t < HIT + 0.03) {
    const u = seg(t, 0.5, HIT), e = ease.inCubic(u);
    const x = lerp(STAFF[0], TARGET[0], e), y = lerp(STAFF[1], TARGET[1], e);
    for (let i = 1; i <= 6; i++) {
      const a = Math.max(0, u - i * 0.035);
      const tx = lerp(STAFF[0], TARGET[0], ease.inCubic(a)), ty = lerp(STAFF[1], TARGET[1], ease.inCubic(a));
      p.dot(tx, ty, i < 3 ? C[4] : C[3], Math.max(0, 0.75 - i * 0.1));
      if (i < 4) p.dot(tx + 1, ty + 1, C[2], 0.3);
    }
    p.circle(x, y, 3.2, C[3], 0.9);
    p.circle(x, y, 2.0, C[4], 1);
    p.circle(x, y, 0.9, WHITE, 1);
    p.glow(x, y, 11, C[4], 0.35);
    // pressure lines behind the bolt
    for (let i = 0; i < 3; i++) p.line(x - 6 - i * 3, y - 2 + i * 2, x - 10 - i * 4, y - 2 + i * 2, C[3], 0.4);
    if (u < 0.25) {
      p.ring(x, y, 6 + u * 20, 1, C[5], 0.5 * (1 - u * 4));
      p.glow(x, y, 16, C[5], 0.3);
    }
  }
  // --- impact: a rune ring opens on the body, light dust falls, a floor seal answers
  if (t >= HIT) {
    const q = seg(t, HIT, 0.9), kk = 1 - q;
    hitStar(p, TARGET[0], TARGET[1], 5.2 * (0.55 + kk * 0.45), C, kk);
    p.ring(TARGET[0], TARGET[1], 4 + q * 16, 1, C[4], 0.55 * kk);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + 0.2;
      p.dot(TARGET[0] + Math.cos(a) * (5 + q * 16), TARGET[1] + Math.sin(a) * (5 + q * 13), C[4], 0.6 * kk);
    }
    sparks(p, TARGET[0], TARGET[1], t - HIT, seed + 31, C, 9, 1.0, 0.32);
    // drifting arcane motes
    burst(8, seed + 41, (r) => {
      const age = t - HIT, life = 0.29;
      if (age > life) return;
      const a = r.range(-Math.PI, 0), sp = r.range(8, 26);
      const [dx, dy] = fly(0, 0, Math.cos(a) * sp, Math.sin(a) * sp - 8, age, -10, 1.2);
      p.dot(TARGET[0] + dx, TARGET[1] + dy, r.next() > 0.5 ? C[5] : C[3], (1 - age / life) * 0.7);
    });
    // the target mark on the floor cools out
    groundRing(p, 42, 11, C[2], 0.3 * kk);
    p.glow(42, 0, 14, C[2], 0.1 * kk);
    p.glow(TARGET[0], TARGET[1], 18, C[4], 0.22 * kk);
  }
}

export function drawBack(p, time, o) {
  if (time >= D) return;
  const C = fit(o.palette, 8), k = seg(time, 0.3, 0.55);
  // the target's floor mark appears during the tell
  if (k > 0) {
    groundRing(p, 42, 8 + k * 4, C[1], 0.22 * k);
    groundEllipse(p, 42, 0, 7, 2, C[1], 0.12 * k);
  }
}

function dotted(p, a, b, c, al) {
  const n = 12;
  for (let i = 1; i < n; i++) {
    const u = i / n;
    p.dot(lerp(a[0], b[0], u), lerp(a[1], b[1], u), c, al * (0.5 + 0.5 * Math.sin(u * Math.PI)));
  }
}

const P0 = (t) => t * 7;
