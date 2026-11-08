import { fit, hex, seg, burst, fly } from "../../core/index.js";
import { ribbon, glint, sparks, dustPuff, hitStar, WHITE } from "./_attack.js";

export const meta = {
  name: "Goblin Warrior Slash",
  desc: "哥布林战士的锈剑横斩：举剑蓄力，一道斜向刀光切过身前，命中炸出火星与铁锈碎屑，脚下扬起尘土.",
  tags: ["mob", "attack", "goblin", "fantasy", "melee", "one-shot"],
  kind: "mob-attack",
  size: [112, 72],
  origin: [16, 60],
  duration: 0.8,
  loop: false,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#140b06", "#2e160a", "#54270e", "#824014", "#b05e1e", "#d8903a", "#f0c070", "#fff0c8"],
    seed: 1,
  },
};

export const attack = {
  telegraph: 0.26,
  hits: [{ t: 0.34, amp: 1.4, shake: 0.14, damage: 8, range: 26, target: "hero" }],

  // how the body sells it: wind up through the tell, release on the hit, then recover
  pose: { cast: "slash", windup: 0.26, hold: 0.08, recover: 0.32 },
};

const D = meta.duration, HIT = attack.hits[0].t, STEEL = hex("#c8d0d8");

export function draw(p, time, o) {
  if (time >= D) return;
  const t = time, C = fit(o.palette, 8), seed = o.seed ?? 1;
  // --- the tell: the blade catches the light, a thin line of intent, a scuff of dust
  if (t < HIT + 0.04) {
    const k = seg(t, 0.02, HIT);
    glint(p, 10, -27 - k * 2, 0.25 + k * 0.75, C[5]);
    ribbon(p, [12, -25], [27, -30], [38, -12], 0.6, () => C[3], 0.18 + k * 0.22);
    if (t > 0.06) {
      p.disc(3, -1, 5, C[2], 0.1 + k * 0.08);
      p.dot(2, -3, C[4], 0.5 * k);
    }
    // anticipation sparks crawl up the blade
    burst(4, seed + 11, (r) => {
      const a = r.range(-1.9, -1.1), d = r.range(4, 11) * k;
      p.dot(11 + Math.cos(a) * d, -24 + Math.sin(a) * d, r.next() > 0.5 ? C[5] : STEEL, 0.5 * k);
    });
  }
  // --- the cleave: a fast crescent that lingers for two frames, then cools
  const fade = 1 - seg(t, HIT, HIT + 0.22);
  if (t >= HIT - 0.02 && fade > 0) {
    const [A, Cc, B] = [[14, -25], [30, -31], [37, -10]];
    ribbon(p, A, Cc, B, 5.2, () => C[2], 0.4 * fade);
    ribbon(p, A, Cc, B, 3.6, (u) => (u > 0.55 ? C[5] : C[4]), 0.7 * fade);
    ribbon(p, A, Cc, B, 2.2, () => STEEL, 0.9 * fade);
    ribbon(p, A, Cc, B, 1.0, () => WHITE, fade);
    // a few chips fly off the edge
    sparks(p, 34, -15, t - HIT, seed + 21, C, 12, 1.15, 0.3);
    burstsDust(p, C, t - HIT, seed);
  }
  // --- the hit star sits on the contact point
  if (t >= HIT && t < HIT + 0.2) {
    const k = 1 - seg(t, HIT, HIT + 0.2);
    hitStar(p, 34, -15, 5.5 * (0.6 + k * 0.4), C, k);
    p.glow(34, -15, 15, C[5], 0.34 * k);
  }
  // --- cooling embers and a settling scuff
  if (t > HIT + 0.1 && t < HIT + 0.42) {
    const age = t - HIT - 0.1;
    burst(5, seed + 33, (r) => {
      const [dx, dy] = fly(0, 0, r.range(-18, 16), r.range(-26, -8), age, 30, 1.6);
      p.dot(38 + dx, -6 + dy, r.next() > 0.4 ? C[5] : C[3], Math.max(0, 1 - age / 0.32) * 0.75);
    });
  }
}

export function drawBack(p, time, o) {
  if (time >= D) return;
  const C = fit(o.palette, 8);
  // a low dust shadow under the lunge
  p.disc(6, 0, 9, C[1], 0.1);
}

function burstsDust(p, C, age, seed) {
  dustPuff(p, 32, 0, age, seed + 51, C[3], 9, 1.1, 0.42);
  dustPuff(p, 24, 0, Math.max(0, age - 0.04), seed + 57, C[2], 5, 0.8, 0.38);
}
