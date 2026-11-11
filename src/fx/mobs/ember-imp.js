import { hex } from "../../core/index.js";
import { Grid, shift, shadow } from "./_lib.js";
import { IMP_PAL, impColors, impAction, drawImp, tintHurt, pulse } from "./_imp.js";
import * as emberImpRake from "./ember-imp-rake.js";

export const meta = {
  name: "Ember Imp",
  desc: "余烬小鬼：炉腹发光的矮小魔物，弯角与煤尾，双爪在身前连撕。A furnace-bellied imp with swept horns and ember claws.",
  tags: ["mob", "imp", "ember", "fantasy", "minion", "melee", "loop"],
  kind: "mob",
  size: [72, 84],
  origin: [36, 70],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: IMP_PAL, seed: 3 },
};

export const mob = {
  tier: "minion",
  hp: 30,
  radius: 8,
  height: 30,
  speed: 36,
  hurtFor: 0.32,
  dieFor: 0.85,
  xp: 12,
  attacks: [{ id: "rake", name: "Ember rake", fx: emberImpRake, range: 24, windup: 0.2, cooldown: 2.0, damage: 7 }],
  loot: "pickups/coin-spin",
};

const D = meta.duration, GRID = new Grid(-36, -50, 72, 56);

function impMix(base, u) {
  const feint = pulse(u, 0.42, 0.56);
  const rear = pulse(u, 0.7, 0.8);
  return {
    scale: 1.0,
    hop: base.hop - feint * 1.4,
    shift: base.shift + feint * 1.6 - rear * 0.8,
    hands: {
      L: [-5.6 + feint * 2.0, -12.8 - feint * 1.2 + rear * 0.6],
      R: [6.4 + feint * 1.8, -13.0 - feint * 1.0 + rear * 0.5],
    },
    headX: base.headX + feint * 0.6,
    headY: base.headY - feint * 0.5,
    earL: base.earL + feint * 1.8,
    earR: base.earR + feint * 1.4,
    tail: base.tail + feint * 3,
    grin: Math.max(base.grin, feint),
  };
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = impColors(o);
  const Pz = impAction(t, D, { ...o, phase: 0.2, mix: impMix });
  GRID.clear();
  drawImp(GRID, Pz, C, {
    body(g, ctx) {
      // a singed rag tied at the waist
      ctx.poly([[-4.5, -9.5], [4.5, -9.5], [3.5, -4], [-3.5, -4]], C.skin[1]);
      ctx.line(-3, -8.5, 3, -8.5, C.skin[3]);
      ctx.px(-4.8, -7, C.coal[3]);
    },
    front(g, ctx) {
      // chest ember: a coal sigil that gutters
      const k = 0.6 + 0.4 * Math.sin(Pz.ph * 4);
      const cr = Math.max(1, Math.round(1.2 * Pz.scale));
      g.ellipse(Math.round((ctx.chest.x + Pz.shift) * Pz.scale), Math.round((ctx.chest.y + Pz.bob + Pz.hop) * Pz.scale), cr, cr, C.coal[4], k);
      g.set(Math.round((ctx.chest.x + Pz.shift) * Pz.scale), Math.round((ctx.chest.y + Pz.bob + Pz.hop) * Pz.scale), C.coal[6]);
    },
  });
  tintHurt(GRID, o);
  GRID.draw(p, Pz.fade ?? 1);
  if ((Pz.fade ?? 1) > 0.4) {
    const k = 0.5 + 0.5 * Math.sin(Pz.ph * 4);
    p.glow(Pz.shift * 0.4, -15 + Pz.bob + Pz.hop, 10, C.coal[4], 0.08 * k);
  }
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), Pz = impAction(t, D, { ...o, phase: 0.2, mix: impMix });
  const fade = Pz.fade ?? 1;
  shadow(p, Pz.shift, 0.5, 7.5 - Math.abs(Pz.hop) * 0.6, 1.7 - Math.abs(Pz.hop) * 0.15, hex("#05030a"), 0.42 * fade);
}
