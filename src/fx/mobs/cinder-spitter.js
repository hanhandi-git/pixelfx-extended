import { hex, TAU } from "../../core/index.js";
import { Grid, shift, shadow } from "./_lib.js";
import { IMP_PAL, impColors, impAction, drawImp, tintHurt, pulse } from "./_imp.js";
import * as cinderSpitterSpit from "./cinder-spitter-spit.js";

export const meta = {
  name: "Cinder Spitter",
  desc: "熔吐者：鼓着熔核的矮小魔物，张嘴蓄焰，朝远处敌人喷吐一团火球。A coal-sac imp that inflates its maw and spits fire.",
  tags: ["mob", "imp", "ember", "fantasy", "minion", "ranged", "caster", "loop"],
  kind: "mob",
  size: [72, 84],
  origin: [36, 70],
  duration: 2.6,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: IMP_PAL, seed: 8, coal: ["#140a06", "#341408", "#5a2410", "#8a3c14", "#c05a1c", "#f08a30", "#ffbe5a", "#ffe9a0"] },
};

export const mob = {
  tier: "minion",
  hp: 26,
  radius: 8,
  height: 30,
  speed: 26,
  hurtFor: 0.3,
  dieFor: 0.85,
  xp: 14,
  attacks: [{ id: "spit", name: "Cinder spit", fx: cinderSpitterSpit, range: 34, windup: 0.3, cooldown: 2.6, damage: 8 }],
  loot: "pickups/coin-spin",
};

const D = meta.duration, GRID = new Grid(-36, -50, 72, 56);

function spitterMix(base, u) {
  const swell = pulse(u, 0.5, 0.72);
  const hop = Math.max(0, Math.sin(u * TAU * 2 + 0.8)) ** 8 * 0.8;
  return {
    scale: 1.0,
    hop: base.hop - hop * 2.4,
    bob: base.bob - swell * 1.2,
    squash: base.squash + swell * 0.05,
    shift: base.shift - swell * 0.6,
    hands: {
      L: [-6.0 - swell * 1.4, -13.0 + base.bob * 0.2 - swell * 0.8],
      R: [6.8 - swell * 1.0, -13.2 + base.bob * 0.25 - swell * 0.6],
    },
    headX: base.headX - swell * 0.8,
    headY: base.headY - swell * 1.6 - hop * 0.5,
    earL: base.earL - swell * 3,
    earR: base.earR - swell * 2.4,
    grin: Math.max(base.grin, swell),
    tail: base.tail + swell * 2,
  };
}
export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = impColors(o);
  const Pz = impAction(t, D, { ...o, phase: 0.55, mix: spitterMix });
  GRID.clear();
  drawImp(GRID, Pz, C, {
    back(g, ctx) {
      // a small coal sac strapped between the shoulders
      const k = 0.6 + 0.4 * Math.sin(Pz.ph * 3);
      const bx = Math.round((-3 + Pz.shift) * Pz.scale), by = Math.round((-21 + Pz.bob + Pz.hop) * Pz.scale);
      g.ellipse(bx, by, Math.max(1, Math.round(2.4 * Pz.scale)), Math.max(1, Math.round(2.4 * Pz.scale)), C.coal[3], k);
      g.ellipse(bx, by, Math.max(1, Math.round(1.3 * Pz.scale)), Math.max(1, Math.round(1.3 * Pz.scale)), C.coal[5]);
      g.set(Math.round((-3 + Pz.shift) * Pz.scale), Math.round((-21 + Pz.bob + Pz.hop) * Pz.scale), C.coal[7]);
    },
    body(g, ctx) {
      // scorched vest of patched leather
      ctx.poly([[-4.6, -17], [4.6, -17], [4.0, -7], [-4.0, -7]], C.horn[2]);
      ctx.line(-3.6, -14, 3.6, -14, C.horn[4]);
      ctx.px(0, -12, C.coal[4]);
      ctx.px(-2, -10, C.coal[3]); ctx.px(2.4, -9, C.coal[3]);
    },
    front(g, ctx) {
      // the maw glows as it charges
      const swell = pulse(Pz.u, 0.5, 0.72);
      const k = swell * (0.5 + 0.5 * Math.sin(Pz.ph * 6));
      const mx = Math.round((ctx.head.x + Pz.shift + 0.6) * Pz.scale), my = Math.round((ctx.head.y + 3.2 + Pz.bob + Pz.hop) * Pz.scale);
      const mr = Math.max(1, Math.round((1.2 + swell * 0.9) * Pz.scale));
      g.ellipse(mx, my, mr, mr, C.coal[4], 0.4 + k * 0.6);
      if (swell > 0.3) {
        g.set(mx, my, C.coal[6]);
        for (let i = 0; i < 4; i++) {
          const a = i * 1.9 + Pz.ph * 4;
          g.set(mx + Math.round(Math.cos(a) * 3), my + Math.round(Math.sin(a) * 2), C.coal[5], 0.3 * swell);
        }
      }
    },
  });
  tintHurt(GRID, o);
  GRID.draw(p, Pz.fade ?? 1);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), Pz = impAction(t, D, { ...o, phase: 0.55, mix: spitterMix });
  const fade = Pz.fade ?? 1;
  shadow(p, Pz.shift, 0.5, 7 - Math.abs(Pz.hop) * 0.6, 1.6 - Math.abs(Pz.hop) * 0.15, hex("#05030a"), 0.4 * fade);
}
