// A compact launcher volley: a three-shell burst with stepped muzzle flashes and a hot impact fan.
import { READY, Particles, Lights, P, Rng, WHITE, clamp, ease, fit, sparkle } from "../../core/index.js";
import { DNF } from "./_lib.js";

export const meta = {
  name: "Launcher volley",
  desc: "Three red-gold shells leave a chunky launcher in staggered beats; each shell leaves a hard tracer and detonates in a small white-cored fan.",
  tags: ["dnf", "launcher", "projectile", "volley", "explosion", "one-shot"],
  size: [292, 126], origin: [36, 98], duration: 1.8, loop: false, fps: 30, bg: "ground", actor: 2,
  options: { palette: DNF, seed: 73, character: "dnf-dust-gunner" },
};

const SHOTS = [0.1, 0.42, 0.74], FLIGHT = 0.22, TARGETS = [[136, -25], [168, -8], [202, -20]];
const AIM = { ...READY, weapon: "hell-cannon", two: true, fx: 6, fy: -22, sa: 0, crouch: 3, lean: 1, ffx: 9, fbx: -9 };
export const act = {
  targets: TARGETS.map(([x]) => ({ x })),
  poses: [[-0.4, { ...AIM, fx: 2, sa: -0.3 }], [0, AIM],
    ...SHOTS.flatMap(t => [[t, { ...AIM, lean: -3, fx: 3 }, "snap"], [t + 0.16, AIM]]), [meta.duration, AIM]],
  hits: SHOTS.map((t, i) => ({ t: t + FLIGHT, at: i, y: TARGETS[i][1], stop: 0.055, shake: 0.1, amp: 1.5, push: 1.8, straw: 10 })),
};
export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed), ps = new Particles({ rng: R, ground: () => 0, sparks: [C[7], C[6], C[5], C[3]] }), lights = new Lights();
  let t = 0, fired = [false, false, false];
  return {
    update(dt) {
      t += dt;
      for (let i = 0; i < SHOTS.length; i++) if (!fired[i] && t >= SHOTS[i] + FLIGHT) {
        fired[i] = true; const [x, y] = TARGETS[i]; lights.add(x, y, 24, C[5], 0.6, 0.18); lights.add(x, y, 8, WHITE, 0.6, 0.05);
        for (let j = 0; j < 10; j++) { const a = R.range(-Math.PI, -0.1), v = R.range(60, 150); ps.spawn(P.SPARK, x, y, Math.cos(a) * v, Math.sin(a) * v, R.range(0.12, 0.34)); }
      }
      ps.update(dt); lights.update(dt);
    },
    draw(p) {
      for (let i = 0; i < SHOTS.length; i++) {
        const age = t - SHOTS[i], [tx, ty] = TARGETS[i];
        if (age < 0) continue;
        if (age < 0.07) {
          const k = 1 - age / 0.07;
          p.poly([[29,-23],[37,-29],[35,-24],[47,-23],[36,-20],[38,-16]], C[6], k);
          p.line(30,-22,42,-22,WHITE,k); p.glow(33,-22,15,C[5],0.32*k);
        }
        if (age < 0.22) {
          const u = ease.outCubic(clamp(age / 0.22)), x = 30 + (tx - 30) * u, y = -22 + (ty + 22) * u;
          p.line(30, -22, x, y, C[3], 0.5); p.line(x - 6, y + 2, x, y, C[6], 0.7); p.rect(x - 2, y - 1, 4, 2, C[5]); p.glow(x, y, 7, C[4], 0.18);
        }
        if (age >= 0.22 && age < 0.62) {
          const q = (age - 0.22) / 0.4, fade = 1 - q;
          p.circle(tx, ty, 4 + 15 * q, C[3], fade * 0.5);
          p.circle(tx, ty, 1 + 6 * q, q < 0.25 ? WHITE : C[6], fade * 0.8);
          for (let j = 0; j < 6; j++) { const a = -Math.PI + j * Math.PI / 5, d = 6 + q * 22; p.line(tx, ty, tx + Math.cos(a) * d, ty + Math.sin(a) * d, j % 2 ? C[5] : C[6], fade * 0.7); }
          if (age < 0.3) sparkle(p, tx, ty, 14 * (1 - (age - 0.22) / 0.08), WHITE, C[6], 0.7);
        }
      }
      ps.draw(p); lights.draw(p);
    },
  };
}
