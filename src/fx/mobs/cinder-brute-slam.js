import { fit, hex, seg, lerp } from "../../core/index.js";
import { glint, sparks, chunks, dustPuff, hitStar, WHITE } from "./_attack.js";

export const meta = {
  name: "Anvil Slam",
  desc: "熔岩巨魔的砧锤重击：锤身高举蓄焰，砸地激起一圈炭尘火环，命中点龟裂迸火.",
  tags: ["mob", "attack", "imp", "ember", "fantasy", "melee", "heavy", "one-shot"],
  kind: "mob-attack",
  size: [128, 96],
  origin: [16, 78],
  duration: 1.0,
  loop: false,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#1a0c12", "#3a1420", "#6a2430", "#a84848", "#d87858", "#f8b080", "#ffe0b0", "#fff8dc"],
    seed: 1,
  },
};

export const attack = {
  telegraph: 0.4,
  hits: [{ t: 0.52, amp: 1.4, shake: 0.16, damage: 16, range: 36, target: "hero" }],
  pose: { cast: "quake", windup: 0.42, hold: 0.1, recover: 0.36 },
};

const D = meta.duration, HIT = attack.hits[0].t;
const X = 40, Y = -20;

function hammerTell(p, C, u) {
  // the raised hammer head and its ember glow during windup
  const hx = 8 + u * 4, hy = -52 + u * 10;
  p.rect(hx - 5, hy - 3, 10, 7, C[2]);
  p.rect(hx - 4, hy - 2, 8, 5, C[4], 0.9);
  p.dot(hx - 2, hy - 1, C[5]);
  glint(p, hx, hy, 0.5 + u * 0.9, C[5], WHITE);
  // dotted ground line
  for (let i = 1; i < 8; i++) p.dot(lerp(10, X, i / 8), -4, C[4], 0.16 + u * 0.18);
}

export function draw(p, time, o) {
  if (time >= D) return;
  const t = time, C = fit(o.palette, 8), seed = o.seed ?? 1;
  if (t < HIT) {
    hammerTell(p, C, seg(t, 0.02, HIT));
  }
  if (t >= HIT) {
    const q = seg(t, HIT, 0.55), kk = 1 - q;
    // impact: star, crater dust ring, sparks and coal chunks
    hitStar(p, X, Y, 10 + q * 4, C, kk);
    groundRing(p, X, -4, 22 + q * 20, C[4], 0.7 * kk);
    groundRing(p, X, -4, 12 + q * 12, C[5], 0.5 * kk);
    sparks(p, X, Y, t - HIT, seed, C, 11, 1.4, 0.36);
    chunks(p, X, -6, t - HIT, seed + 3, C, 8, 1.1, 0.5);
    dustPuff(p, X - 8, -2, t - HIT, seed + 5, hex("#4a3428"), 8, 1.2);
    dustPuff(p, X + 8, -2, t - HIT, seed + 7, hex("#3a2a20"), 6, 1.1);
    // rising embers
    for (let i = 0; i < 6; i++) {
      const v = (t - HIT) * 1.4 + i * 0.17;
      const ex = X + Math.sin(i * 2.3 + v) * 3, ey = -10 - v * 10;
      if (ey > -58) {
        p.dot(ex, ey, i % 2 ? C[5] : C[4], Math.max(0, kk * 0.9));
        if (i % 3 === 0) p.dot(ex, ey - 1, C[6], kk * 0.6);
      }
    }
    p.glow(X, -8, 16 * kk + 4, C[4], 0.34 * kk);
  }
}

function groundRing(p, cx, cy, r, c, a) {
  // flattened ember ring expanding across the floor
  const ry = Math.max(1.5, r * 0.28), n = Math.max(10, Math.round(r * 1.6));
  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2;
    p.dot(Math.round(cx + Math.cos(th) * r), Math.round(cy + Math.sin(th) * ry), c, a);
  }
}
