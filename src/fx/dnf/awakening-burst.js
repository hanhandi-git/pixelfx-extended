// A close-range awakening burst: the fighter plants a seal, then detonates a vertical red-gold crest.
import { READY, Particles, Lights, P, Rng, WHITE, clamp, ease, fit, sparkle, flare, smooth } from "../../core/index.js";
import { DNF, seal, rune } from "./_lib.js";

export const meta = {
  name: "Awakening burst",
  desc: "A planted red-gold seal opens under the fighter, a crest of light punches upward, then the crest breaks into hot pixels and falling sparks.",
  tags: ["dnf", "awakening", "burst", "seal", "screen", "one-shot"],
  size: [224, 188], origin: [92, 164], duration: 2.2, loop: false, fps: 30, bg: "ground", actor: 2,
  options: { palette: DNF, seed: 61, character: "dnf-ghost-slayer" },
};

const HIT = 0.62;
const READY_POSE = { ...READY, weapon: "blood-cleaver", two: true, fx: 8, fy: -25, bx: -5, by: -24, sa: -0.8 };
const CAST = { ...READY_POSE, x: -4, crouch: 4, lean: -4, fx: -2, fy: -35, bx: 10, by: -28, sa: -2.45 };
const RELEASE = { ...READY_POSE, x: 5, crouch: 6, lean: 7, fx: 19, fy: -30, bx: -7, by: -22, sa: 0.4, ffx: 13, fbx: -10, ghost: 1 };
export const act = {
  target: { x: 58 },
  poses: [[-0.48, READY_POSE], [-0.18, CAST], [0.12, CAST], [HIT, RELEASE, "snap"], [1.2, { ...RELEASE, lean: 4 }], [meta.duration, READY_POSE]],
  hits: [{ t: HIT, stop: 0.18, shake: 0.3, amp: 4, push: 3.2, straw: 24, y: -25 }],
  dust: [{ t: HIT, x: 6, n: 10, dir: 1 }],
};

export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed), ps = new Particles({ rng: R, ground: () => 0, sparks: [C[7], C[6], C[5], C[3]] }), lights = new Lights();
  let t = 0, burst = false;
  return {
    update(dt) {
      t += dt;
      if (!burst && t >= HIT) {
        burst = true;
        lights.add(0, -34, 86, C[5], 0.85, 0.55); lights.add(0, -20, 32, WHITE, 0.7, 0.08);
        for (let i = 0; i < 34; i++) {
          const a = -Math.PI / 2 + R.range(-1.1, 1.1), v = R.range(80, 230);
          ps.spawn(P.SPARK, R.range(-4, 4), -3, Math.cos(a) * v, Math.sin(a) * v - 20, R.range(0.2, 0.7));
        }
      }
      ps.update(dt); lights.update(dt);
    },
    drawBack(p) {
      const q = clamp(t / HIT), k = t < HIT ? ease.outCubic(q) : 1 - smooth(HIT + 0.7, meta.duration, t);
      if (k <= 0) return;
      seal(p, C, 30 + 5 * q, 0.55 + 0.45 * q, t * 2.8, k);
      p.ellipse(0, -1, 30 + q * 10, 3.5, C[2], 0.25 * k);
    },
    draw(p) {
      if (t < HIT) {
        const k = smooth(0.08, HIT, t), r = 6 + k * 18;
        rune(p, 0, -22, r, C, k * 0.7);
        p.glow(0, -22, 26, C[4], 0.2 * k);
      } else {
        const age = t - HIT, rise = ease.outCubic(clamp(age / 0.28)), fade = 1 - smooth(0.58, 1.5, age);
        if (fade > 0) {
          const h = 80 * rise;
          p.poly([[-8, -4], [-5, -h], [0, -h - 16], [5, -h], [8, -4]], C[3], fade * 0.9);
          p.poly([[-3, -4], [-2, -h - 5], [0, -h - 22], [3, -h - 5], [4, -4]], C[6], fade * 0.8);
          p.line(0, -6, 0, -h - 18, WHITE, fade * 0.72);
          // A split, winged crest gives the release its broad dungeon-awakening silhouette.
          for (const side of [-1, 1]) {
            p.poly([[side*4,-h*0.56],[side*37*rise,-h*0.88],[side*24*rise,-h*0.46],[side*46*rise,-h*0.53],[side*19*rise,-h*0.18],[side*7,-8]], C[2], fade);
            p.poly([[side*5,-h*0.58],[side*33*rise,-h*0.81],[side*19*rise,-h*0.43],[side*35*rise,-h*0.48],[side*8,-h*0.18]], C[4], fade*0.9);
            p.line(side*7,-h*0.48,side*30*rise,-h*0.76,C[6],fade*0.7);
          }
          p.glow(0, -h * 0.55, 34, C[5], fade * 0.4);
          flare(p, 0, -h - 18, 20 * fade, fade, C);
          if (age < 0.25) sparkle(p, 0, -h - 18, 20 * (1 - age / 0.25), WHITE, C[6], 0.75);
        }
      }
      ps.draw(p); lights.draw(p);
    },
  };
}
