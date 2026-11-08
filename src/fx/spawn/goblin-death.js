import { fit, hex, seg, ease, TAU, burst, fly } from "../../core/index.js";
import { chunks, dustPuff, groundEllipse, sparks, glint } from "../mobs/_attack.js";

export const meta = {
  name: "Goblin Death",
  desc: "哥布林倒下：暗绿血雾先炸开，尸体塌成一团烟，断刀与骨牙弹落在地，最后一缕绿魂向上飘散.",
  tags: ["spawn", "death", "goblin", "minion", "blood", "soul", "one-shot"],
  kind: "effect",
  size: [128, 88],
  origin: [64, 74],
  duration: 1.5,
  loop: false,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#0b120a", "#1d2c16", "#33512a", "#4f7a34", "#6ea244", "#a8c86a", "#e0f0b0", "#ffffff"],
    blood: ["#1a0a08", "#3a1210", "#5c1a16", "#7e241c", "#a83628", "#d4583a"],
    soul: ["#0d2a18", "#1e5c2a", "#3f9a44", "#7ed07a", "#c8f4b8", "#ffffff"],
    seed: 1,
  },
};

const D = meta.duration, HIT = 0.08, Y = -16;

export function draw(p, t, o) {
  if (t >= D) return;
  const C = fit(o.palette, 8), B = fit(o.blood, 6), S = fit(o.soul, 6), seed = o.seed ?? 1;
  const age = t - HIT;

  // the body gives: a short dark flash where it stood
  if (t < HIT + 0.05) {
    const k = 1 - seg(t, HIT, HIT + 0.05);
    p.disc(0, Y, 9, B[2], 0.5 * k);
    p.glow(0, Y, 16, B[4], 0.25 * k);
  }
  // blood and gear thrown out, then the smoke takes the place
  if (age >= 0 && age < 0.5) {
    const k = 1 - age / 0.5;
    sparks(p, 0, Y, age, seed + 3, B, 10, 1.1, 0.34);
    chunks(p, 0, Y, age, seed + 7, C, 10, 1.0, 0.4);
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI * 0.85 + (i / 4) * Math.PI * 0.7;
      p.disc(Math.cos(a) * (6 + age * 18), Y + Math.sin(a) * (4 + age * 12), 3 + age * 4, C[2], 0.2 * k);
    }
  }
  // the corpse collapses into smoke that lifts and thins
  if (age >= 0.05 && age < 1.1) {
    const k = seg(age, 0.05, 1.1);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU + 0.4;
      const r = 4 + k * 13 + (i % 2) * 2;
      const x = Math.cos(a) * r, y = Y + 2 - k * 16 + Math.sin(a) * r * 0.35;
      const fade = Math.sin(Math.min(1, k * 1.2) * Math.PI) * (i % 2 ? 0.3 : 0.22);
      p.disc(x, y, 4 + k * 5, i % 2 ? C[3] : C[2], fade);
      if (i % 3 === 0) p.dot(x + 1, y - 1, C[5], fade * 0.5);
    }
    dustPuff(p, 0, 2, age - 0.05, seed + 11, C[3], 8, 1.3, 0.5);
    groundEllipse(p, 0, 2, 10 + k * 4, 2.6, C[0], 0.24 * (1 - k));
  }
  // a broken blade and a tooth bounce out and settle on the floor
  gear(p, age, C, seed);
  // the soul: a green wisp rises out of the smoke, finds its line and lets go
  if (age > 0.18 && age < 1.2) {
    const k = seg(age, 0.18, 1.2);
    const wob = Math.sin(k * 9) * 2.2;
    const x = wob, y = Y - 6 - k * 30;
    const a = Math.min(1, k * 4) * Math.min(1, (1 - k) * 2.2);
    p.disc(x, y, 2.6 + (1 - k) * 1.6, S[3], 0.75 * a);
    p.dot(x, y - 1, S[4], a);
    p.dot(x + 1, y, S[5], a * 0.8);
    p.glow(x, y, 9, S[3], 0.2 * a);
    for (let i = 1; i <= 3; i++) p.dot(x + Math.sin(k * 9 - i) * 1.6, y + i * 2.6, S[2], a * (0.5 - i * 0.1));
    if (k > 0.8) glint(p, x, y, (k - 0.8) * 2, S[4], S[5]);
  }
}

export function drawBack(p, t, o) {
  if (t >= D) return;
  const C = fit(o.palette, 8);
  // a blood soak that stays a beat longer than the body
  const age = t - HIT;
  if (age >= 0 && age < 1.4) {
    const k = 1 - seg(age, 0.2, 1.4);
    groundEllipse(p, 0, 1, 9 * (0.5 + (1 - k) * 0.5), 2.2, C[0], 0.3 * k);
    p.disc(0, 2, 7, C[1], 0.12 * k);
  }
}

function gear(p, age, C, seed) {
  if (age < 0 || age > 1.1) return;
  const RUST = ["#1a0e08", "#3a1c0e", "#6a3418", "#95502a", "#c07040"].map(hex);
  // two props: a blade hilt with a stub, and a tooth, both thrown with gravity and stopped by the floor
  const props = [
    { a: -Math.PI * 0.78, sp: 92, spin: 7, col: RUST[3], len: 7 },
    { a: -Math.PI * 0.62, sp: 64, spin: -5, col: C[5], len: 4 },
  ];
  props.forEach((q, i) => {
    const r = (n) => ((Math.sin((seed + i * 31 + n * 7) * 12.9898) * 43758.5453) % 1 + 1) % 1;
    const vx = Math.cos(q.a) * q.sp * (0.85 + r(1) * 0.3), vy = Math.sin(q.a) * q.sp * (0.85 + r(2) * 0.3);
    const g = 220;
    const tl = (-vy + Math.sqrt(vy * vy + 2 * g * (-2 - Y))) / g;
    const t0 = Math.min(age, tl);
    const x = vx * t0, y = Y + vy * t0 + 0.5 * g * t0 * t0;
    const landed = age >= tl;
    const rot = q.spin * t0 * (landed ? 0.15 : 1);
    const dx = Math.cos(rot) * q.len, dy = Math.sin(rot) * q.len;
    p.line(x - dx, y - dy, x + dx, y + dy, q.col, 1);
    p.dot(x + dx * 0.5, y + dy * 0.5, C[6], 0.8);
    if (landed) p.dot(x, 0, C[0], 0.5);
  });
}
