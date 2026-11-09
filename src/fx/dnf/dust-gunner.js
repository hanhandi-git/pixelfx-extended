import { posed, TAU } from "../../core/index.js";
export const meta = {
  name: "Dustland gunner", desc: "Swept blond hair, a green scarf, a burgundy split coat and brass cartridge belt; the gunner braces a squared heavy cannon.",
  tags: ["dnf", "character", "gunner", "loop"], size: [120, 100], origin: [49, 88], duration: 2.4, loop: true, fps: 12, bg: "ground", options: { seed: 1 },
};
export function draw(p,t) {
  const breath = Math.sin(t / meta.duration * TAU);
  const r = posed({ weapon: "hell-cannon", two: true, fx: 7, fy: -22, sa: -0.1, crouch: 1 + breath * 0.5, ffx: 8, fbx: -6 }, "dnf-dust-gunner");
  for(let i=0;i<r.n;i++) p.px(r.xs[i],r.ys[i],r.color[i]);
}
