// Shared looks for goblin attacks. Everything here is a pure function of time and seed, so a one-shot can be
// sampled at any frame without stepping a simulation: a tapered blade ribbon, ground dust, flying debris and
// short spark trails.
import { hex, TAU, burst, fly } from "../../core/index.js";

export const WHITE = hex("#fffaf0");

/**
 * A tapered ribbon along the quadratic A -> C -> B. col is a color or fn(u); w is the widest half-width in px;
 * a is the opacity. The ends pinch to nothing so the trail reads as a blade arc, not a sausage.
 */
export function ribbon(p, A, C, B, w, col, a = 1) {
  const N = 90;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const x = (1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * C[0] + u * u * B[0];
    const y = (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * C[1] + u * u * B[1];
    const dx = 2 * (1 - u) * (C[0] - A[0]) + 2 * u * (B[0] - C[0]);
    const dy = 2 * (1 - u) * (C[1] - A[1]) + 2 * u * (B[1] - C[1]);
    const n = Math.hypot(dx, dy) || 1;
    const half = w * Math.pow(Math.sin(Math.PI * u), 0.7);
    if (half < 0.25) continue;
    const c = typeof col === "function" ? col(u) : col;
    p.line(x - (dy / n) * half, y + (dx / n) * half, x + (dy / n) * half, y - (dx / n) * half, c, a);
  }
}

/** A ring of dust rising from the ground at (x, y), age seconds after the hit. */
export function dustPuff(p, x, y, age, seed, color, n = 9, spread = 1, life = 0.55) {
  if (age < 0 || age > life) return;
  burst(n, seed, (r) => {
    const a = r.range(-Math.PI, -0.12), sp = r.range(14, 46) * spread;
    const [dx, dy] = fly(0, 0, Math.cos(a) * sp, Math.sin(a) * sp - 6, age, 10, 2.2);
    const k = Math.max(0, 1 - age / life) * r.range(0.3, 0.62);
    p.dot(x + dx, y + dy, color, k);
    if (r.next() > 0.55) p.disc(x + dx, y + dy, 1.2 + r.range(0, 0.8), color, k * 0.45);
  });
}

/** Flying debris: chunks with gravity that stop at the ground line. */
export function chunks(p, x, y, age, seed, ramp, n = 10, power = 1, life = 0.6) {
  if (age < 0 || age > life) return;
  burst(n, seed, (r) => {
    const a = r.range(-Math.PI * 0.92, -Math.PI * 0.08), sp = r.range(28, 92) * power;
    const [dx, dy] = fly(0, 0, Math.cos(a) * sp, Math.sin(a) * sp, age, 260, 0);
    if (dy > 0.5) return;
    const k = Math.max(0.15, 1 - age / life);
    const c = ramp[Math.min(ramp.length - 1, 1 + Math.floor(r.range(0, ramp.length - 1)))];
    if (r.next() > 0.5) p.rect(x + dx, y + dy, 2, 1, c, k);
    else p.dot(x + dx, y + dy, c, k);
  });
}

/** Short spark streaks thrown from a hit, with gravity and a tail along the velocity. */
export function sparks(p, x, y, age, seed, ramp, n = 8, power = 1, life = 0.32) {
  if (age < 0 || age > life) return;
  burst(n, seed, (r) => {
    const a = r.range(-Math.PI * 0.95, -Math.PI * 0.05), sp = r.range(45, 130) * power;
    const vx = Math.cos(a) * sp, vy = Math.sin(a) * sp;
    const [dx, dy] = fly(0, 0, vx, vy, age, 200, 0);
    const [px, py] = fly(0, 0, vx, vy, Math.max(0, age - 0.03), 200, 0);
    const k = Math.max(0, 1 - age / life);
    if (k <= 0.02) return;
    const c = ramp[Math.min(ramp.length - 1, 3 + Math.floor(r.range(0, ramp.length - 3)))];
    p.line(x + px, y + py, x + dx, y + dy, c, k);
    p.dot(x + dx, y + dy, WHITE, k * 0.8);
  });
}

/** A hard hit star: white core, eight rays, a thin ring and light. k fades it out. */
export function hitStar(p, x, y, r, C, k) {
  if (k <= 0.01) return;
  p.circle(x, y, Math.max(0.7, r * 0.3), WHITE, 1);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + 0.22, len = (i % 2 ? r * 0.9 : r * 1.5) * (0.45 + k * 0.55);
    p.line(x + Math.cos(a) * 1.2, y + Math.sin(a) * 1.2, x + Math.cos(a) * len, y + Math.sin(a) * len * 0.9, i % 2 ? C[4] : WHITE, Math.min(1, 0.4 + k * 0.6));
  }
  p.ring(x, y, r * 1.5, 1, C[4], 0.4 * k);
  p.glow(x, y, r * 2.6, C[4], 0.18 * k);
}

/** A flat ellipse on the ground (the ground plane is squashed), for shadows and floor seals. */
export function groundEllipse(p, x, y, rx, ry, c, a) {
  if (rx <= 0 || a <= 0) return;
  for (let sy = Math.floor(-ry); sy <= Math.ceil(ry); sy++)
    for (let sx = Math.floor(-rx); sx <= Math.ceil(rx); sx++) {
      const d = (sx / rx) ** 2 + (sy / ry) ** 2;
      if (d < 1) p.dot(x + sx, y + sy, c, a * (1 - d) ** 0.6);
    }
}

/** A dashed ring lying on the ground, for telegraphs. */
export function groundRing(p, x, r, c, a) {
  if (r <= 0 || a <= 0) return;
  const steps = Math.max(18, Math.round(r * 6));
  for (let i = 0; i < steps; i++) {
    const ang = (i / steps) * TAU;
    p.dot(x + Math.cos(ang) * r, Math.sin(ang) * r * 0.28, c, a);
  }
}

/** A four-point glint that grows and fades; k 0..1. */
export function glint(p, x, y, k, c, tip = WHITE) {
  if (k <= 0.01) return;
  const n = Math.round(1 + k * 3);
  p.dot(x, y, tip, 1);
  for (let d = 1; d <= n; d++) {
    p.dot(x + d, y, d === n ? tip : c, 0.85);
    p.dot(x - d, y, d === n ? tip : c, 0.85);
    p.dot(x, y + d, d === n ? tip : c, 0.7);
    p.dot(x, y - d, d === n ? tip : c, 0.7);
  }
  p.glow(x, y, 4 + k * 6, c, 0.16 * k);
}
