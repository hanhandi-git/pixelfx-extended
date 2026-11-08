import { fit, hex, seg, burst, fly, TAU } from "../../core/index.js";
import { chunks, dustPuff, groundEllipse, hitStar, WHITE } from "../mobs/_attack.js";

export const meta = {
  name: "Goblin Hit",
  desc: "哥布林挨打：白色顿帧、暗绿血花与骨屑从伤口溅开，两道漫画冲击线从身后扎进来，脚下带起一小团灰.",
  tags: ["impact", "hit", "hurt", "goblin", "blood", "minion", "one-shot"],
  kind: "effect",
  size: [96, 64],
  origin: [34, 52],
  duration: 0.55,
  loop: false,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#0b120a", "#1d2c16", "#33512a", "#4f7a34", "#6ea244", "#a8c86a", "#e0f0b0", "#ffffff"],
    blood: ["#1a0a08", "#3a1210", "#5c1a16", "#7e241c", "#a83628", "#d4583a"],
    seed: 1,
  },
};

const D = meta.duration, HIT = 0.1;

export function draw(p, t, o) {
  if (t >= D) return;
  const C = fit(o.palette, 8), B = fit(o.blood, 6), seed = o.seed ?? 1;
  const X = 0, Y = -14;

  // the white frame: the whole hit is two bright pixels of contact before the body knows
  if (t < HIT + 0.033) {
    const k = 1 - seg(t, HIT, HIT + 0.033);
    p.disc(X, Y, 5, WHITE, 0.4 * k);
    hitStar(p, X, Y, 4.2, C, k);
  }
  // the spray: dark green blood and pale chips, thrown back along the blow
  const age = t - HIT;
  if (age >= 0 && age < 0.34) {
    const k = 1 - age / 0.34;
    burst(12, seed + 3, (r) => {
      const a = r.range(Math.PI * 0.55, Math.PI * 1.65), sp = r.range(36, 104);
      const [dx, dy] = fly(0, 0, Math.cos(a) * sp, Math.sin(a) * sp, age, 180, 0);
      if (dy > 2) return;
      const c = r.next() > 0.45 ? B[3 + Math.floor(r.range(0, 2.99))] : C[4 + Math.floor(r.range(0, 2.99))];
      p.dot(X + dx, Y + dy, c, k);
      if (r.next() > 0.6) p.dot(X + dx + 1, Y + dy + 1, B[2], k * 0.8);
    });
    chunks(p, X, Y, age, seed + 5, C, 6, 0.7, 0.3);
  }
  // two comic impact lines jabbing in from behind the body
  if (t > HIT && t < HIT + 0.12) {
    const k = 1 - seg(t, HIT, HIT + 0.12);
    for (const [a, len] of [[Math.PI * 0.92, 13], [Math.PI * 1.12, 9]]) {
      const x = X + Math.cos(a) * len, y = Y + Math.sin(a) * len;
      p.line(x + 4, y - 1, x, y, C[6], k);
      p.line(x + 3, y + 3, x, y + 1, C[5], k * 0.8);
    }
  }
  // the floor takes the stagger
  if (age >= 0 && age < 0.4) {
    groundEllipse(p, X - 4, 4, 8, 2.4, C[1], 0.2 * (1 - age / 0.4));
    dustPuff(p, X - 5, 4, age, seed + 9, C[3], 6, 0.9, 0.3);
  }
  if (age >= 0 && age < 0.2) p.glow(X, Y, 14, C[5], 0.22 * (1 - age / 0.2));
}

export function drawBack(p, t, o) {
  if (t >= D) return;
  const C = fit(o.palette, 8);
  p.disc(0, 3, 9, C[1], 0.1);
}
