// A looping berserker aura: hard red motes orbit a dark core, with a cyan counter-light on the floor.
import { TAU, fit } from "../../core/index.js";
import { DNF, CYAN, seal } from "./_lib.js";

export const meta = {
  name: "Berserker rage aura",
  desc: "A looping berserker aura: red motes orbit a dark core, short blade marks pulse behind the body and a cool counter-light keeps the feet readable.",
  tags: ["dnf", "aura", "berserker", "buff", "loop"],
  size: [112, 132], origin: [56, 118], duration: 2.4, loop: true, fps: 30, bg: "ground", actor: 2,
  options: { palette: DNF, seed: 23 },
};

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8), q = 0.62 + 0.2 * Math.sin(t * TAU / meta.duration);
  seal(p, CYAN, 26, q, t / meta.duration * TAU, 0.8);
  p.glow(0, -18, 34, C[4], 0.12 + q * 0.06);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), phase = t / meta.duration;
  for (let i = 0; i < 14; i++) {
    const a = phase * TAU * (i % 2 ? -1 : 2) + i * TAU / 14, r = 13 + (i % 4) * 4, x = Math.cos(a) * r, y = -18 + Math.sin(a) * r * 0.65;
    const k = 0.65 + 0.35 * Math.sin((phase + i / 14) * TAU);
    p.dot(x, y, i % 3 ? C[4] : C[6], k); p.glow(x, y, 4, C[4], 0.12 * k);
  }
  for (let i = 0; i < 6; i++) {
    const a = phase * TAU * -1 + i * TAU / 6, x = Math.cos(a) * (24 + i % 2 * 4), y = -20 + Math.sin(a) * 22;
    p.line(x, y, x + Math.cos(a + 0.3) * 5, y + Math.sin(a + 0.3) * 5, C[3], 0.6);
  }
}
