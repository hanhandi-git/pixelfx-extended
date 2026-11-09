// A hooked chain thrown low across the floor: links catch light one by one, then recoil into a red spark.
import { Particles, Lights, P, Rng, WHITE, clamp, ease, fit, sparkle, smooth } from "../../core/index.js";
import { DNF } from "./_lib.js";

export const meta = {
  name: "Chain pull",
  desc: "A hooked chain skims the floor in a stepped pixel arc, catches with a white spark, then snaps back through a trail of red links.",
  tags: ["dnf", "chain", "projectile", "hook", "thrown", "one-shot"],
  size: [248, 96], origin: [34, 72], duration: 1.35, loop: false, fps: 30, bg: "ground",
  options: { palette: DNF, seed: 19 },
};

const RELEASE = 0.08, HIT = 0.72, END = 1.2, TX = 148, TY = -7;
export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed), ps = new Particles({ rng: R, ground: () => 0, sparks: [C[7], C[6], C[5], C[3]] }), lights = new Lights();
  let t = 0, latched = false;
  const point = (u) => {
    const x = 10 + (TX - 10) * u, y = -12 - Math.sin(u * Math.PI) * 24 + Math.sin(u * 10) * 1.2;
    return [x, y];
  };
  return {
    update(dt) {
      t += dt;
      if (!latched && t >= HIT) {
        latched = true; lights.add(TX, TY, 32, C[5], 0.7, 0.25); lights.add(TX, TY, 12, WHITE, 0.7, 0.06);
        for (let i = 0; i < 18; i++) {
          const a = R.range(-Math.PI, 0), v = R.range(45, 150);
          ps.spawn(P.SPARK, TX, TY, Math.cos(a) * v, Math.sin(a) * v - 25, R.range(0.16, 0.46));
        }
      }
      ps.update(dt); lights.update(dt);
    },
    draw(p) {
      if (t < RELEASE || t >= meta.duration) return;
      const out = t < HIT ? ease.outCubic(clamp((t - RELEASE) / (HIT - RELEASE))) : 1 - smooth(END, meta.duration, t);
      const head = t < HIT ? out : 1;
      const back = t < HIT ? 0 : clamp((t - HIT) / (END - HIT));
      const u0 = back * 0.98, u1 = head;
      let prev = point(u0);
      for (let i = 0; i <= 24; i++) {
        const u = u0 + (u1 - u0) * i / 24, [x, y] = point(u);
        if (i) {
          p.line(prev[0], prev[1], x, y, i % 3 ? C[3] : C[5], 0.82);
          p.glow(x, y, 4, C[4], 0.11);
        }
        if (i % 2 === 0) p.polyline([[x-2,y],[x,y-2],[x+3,y],[x,y+2],[x-2,y]], i % 4 ? C[4] : C[6], 0.9);
        prev = [x, y];
      }
      if (t < HIT) {
        const [x, y] = point(head); p.line(x, y, x + 8, y - 4, C[6], 1); p.line(x + 8, y - 4, x + 5, y - 9, C[6], 1); p.dot(x + 5, y - 9, WHITE);
      } else if (t < HIT + 0.18) sparkle(p, TX, TY, 15 * (1 - (t - HIT) / 0.18), WHITE, C[6], 0.8);
      ps.draw(p); lights.draw(p);
    },
  };
}
