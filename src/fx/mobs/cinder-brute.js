import { hex } from "../../core/index.js";
import { Grid, shift, shadow } from "./_lib.js";
import { IMP_PAL, impColors, impAction, drawImp, tintHurt, pulse } from "./_imp.js";
import * as cinderBruteSlam from "./cinder-brute-slam.js";

export const meta = {
  name: "Cinder Brute",
  desc: "熔岩巨魔：炉腹的重装魔物，肩扛熔岩砧锤，两脚砸地掀起炭尘与火环。A furnace-bellied brute that slams a lava anvil hammer.",
  tags: ["mob", "imp", "ember", "fantasy", "minion", "heavy", "melee", "loop"],
  kind: "mob",
  size: [96, 96],
  origin: [48, 84],
  duration: 3.0,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: IMP_PAL, seed: 21 },
};

export const mob = {
  tier: "elite",
  hp: 72,
  radius: 13,
  height: 40,
  speed: 18,
  hurtFor: 0.4,
  dieFor: 1.0,
  xp: 30,
  attacks: [{ id: "slam", name: "Anvil slam", fx: cinderBruteSlam, range: 30, windup: 0.42, cooldown: 3.2, damage: 16 }],
  loot: "pickups/coin-spin",
};

const D = meta.duration, GRID = new Grid(-48, -56, 96, 64);

function bruteMix(base, u) {
  const stomp = Math.max(0, Math.sin(u * TAU * 2)) ** 10 * 0.7;
  const raise = pulse(u, 0.56, 0.7);
  return {
    scale: 1.18,
    hop: base.hop - stomp * 2.6 - raise * 1.6,
    bob: base.bob + raise * 1.4,
    squash: base.squash + stomp * 0.04,
    lean: (base.lean ?? 0) - raise * 0.5,
    shift: base.shift - raise * 1.6,
    armLen: 1.15,
    hands: {
      L: [-7.2 - raise * 2.0, -13.0 - raise * 4.0 + stomp],
      R: [7.8 - raise * 1.4, -13.4 - raise * 3.2 + stomp * 0.5],
    },
    headX: base.headX - raise * 0.9,
    headY: base.headY + raise * 1.4,
    earL: base.earL + raise * 3,
    earR: base.earR + raise * 2.2,
    tail: base.tail - raise * 3,
    grin: Math.max(base.grin, raise * 0.8),
  };
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = impColors(o);
  const Pz = impAction(t, D, { ...o, phase: 0.35, mix: bruteMix });
  GRID.clear();
  drawImp(GRID, Pz, C, {
    back(g, ctx) {
      // shoulder pauldrons of dark iron plates
      for (const side of [-1, 1]) {
        const cx = side * 6.2 + Pz.shift * 0.4, cy = -23 + Pz.bob + Pz.hop;
        const pr = Math.max(2, Math.round(3.4 * Pz.scale));
        g.ellipse(Math.round(cx * Pz.scale), Math.round(cy * Pz.scale), pr, pr, C.horn[2]);
        g.ellipse(Math.round(cx * Pz.scale), Math.round(cy * Pz.scale), Math.max(1, Math.round(2.0 * Pz.scale)), Math.max(1, Math.round(2.0 * Pz.scale)), C.horn[3]);
        g.set(Math.round((cx - 0.8) * Pz.scale), Math.round((cy - 0.8) * Pz.scale), C.horn[4]);
      }
    },
    body(g, ctx) {
      // riveted slag apron over the furnace belly
      ctx.poly([[-5.6, -18], [5.6, -18], [5.0, -6], [-5.0, -6]], C.horn[1]);
      ctx.line(-4.6, -15, 4.6, -15, C.horn[3]);
      ctx.line(-4.2, -11, 4.2, -11, C.horn[2]);
      for (const [rx, ry] of [[-3, -14], [0, -14], [3, -14], [-3.4, -8], [3.4, -8]]) ctx.px(rx, ry, C.coal[3]);
    },
    front(g, ctx) {
      // the anvil hammer rides in the right fist; it swings with the cast pose
      const hx = ctx.hands.R.x + Pz.shift * 0, hy = ctx.hands.R.y;
      const ang = Pz.casting ? -0.5 : 0.15 + Math.sin(Pz.ph * 2) * 0.05;
      const head = [hx + Math.cos(ang) * 6, hy - 1 + Math.sin(ang) * 6];
      const helve = [[hx, hy], [hx + Math.cos(ang) * 3, hy - 0.5 + Math.sin(ang) * 3], head];
      for (let i = 1; i < helve.length; i++) {
        g.tube([helve[i - 1], helve[i]].map(([x, y]) => [Math.round((x + Pz.shift) * Pz.scale), Math.round((y + Pz.bob + Pz.hop) * Pz.scale)]),
          () => Math.max(0.8, 1.1 * Pz.scale), (u, v) => v > 0.5 ? C.horn[4] : C.horn[3]);
      }
      const [cx2, cy2] = [Math.round((head[0] + Pz.shift) * Pz.scale), Math.round((head[1] + Pz.bob + Pz.hop) * Pz.scale)];
      g.rect(cx2 - Math.round(2.4 * Pz.scale), cy2 - Math.round(1.8 * Pz.scale), Math.round(4.8 * Pz.scale), Math.round(3.6 * Pz.scale), C.horn[2]);
      g.rect(cx2 - Math.round(1.6 * Pz.scale), cy2 - Math.round(1.1 * Pz.scale), Math.round(3.2 * Pz.scale), Math.round(2.2 * Pz.scale), C.coal[3]);
      g.set(cx2 - Math.round(1.2 * Pz.scale), cy2 - Math.round(1.4 * Pz.scale), C.coal[5]);
      // furnace mouth glow on the chest
      const k = 0.55 + 0.45 * Math.sin(Pz.ph * 3.5);
      const mx = Math.round((ctx.chest.x + Pz.shift) * Pz.scale), my = Math.round((ctx.chest.y + Pz.bob + Pz.hop) * Pz.scale);
      const fr = Math.max(1, Math.round(1.6 * Pz.scale));
      g.ellipse(mx, my, fr, fr, C.coal[4], k);
      g.set(mx, my, C.coal[6]);
    },
  });
  tintHurt(GRID, o);
  GRID.draw(p, Pz.fade ?? 1);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), Pz = impAction(t, D, { ...o, phase: 0.35, mix: bruteMix });
  const fade = Pz.fade ?? 1;
  shadow(p, Pz.shift, 0.5, 11 - Math.abs(Pz.hop) * 0.8, 2.2 - Math.abs(Pz.hop) * 0.2, hex("#05030a"), 0.5 * fade);
}
