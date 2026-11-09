import { posed, TAU } from "../../core/index.js";
export const meta = {
  name: "Ghosthand slayer", desc: "Silver spikes, a scarlet scarf, a red armored arm, exposed abdomen and baggy cobalt trousers; the fighter holds a broad clipped blade at the shoulder.",
  tags: ["dnf", "character", "slayer", "loop"], size: [120, 100], origin: [49, 88], duration: 2.4, loop: true, fps: 12, bg: "ground", options: { seed: 1 },
};
export function draw(p,t) {
  const breath = Math.sin(t / meta.duration * TAU);
  const r = posed({ weapon: "blood-cleaver", fx: 7, fy: -20, sa: -2.95, crouch: 2 + breath * 0.5, ffx: 9, fbx: -8, lean: -1 }, "dnf-ghost-slayer");
  for(let i=0;i<r.n;i++) p.px(r.xs[i],r.ys[i],r.color[i]);
}
