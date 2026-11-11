// A firefly hollow at dusk: violet sky, a low ember moon, and a campsite of canvas, bronze and warm flame.
import { fit, hex, mix, rand, TAU } from "../../core/index.js";
import { bake, blit, sky, stars, moon, ridge, foliage, mist, fireflies, motes, shaft } from "./_lib.js";
import { limb, contour, rock, marshTree } from "./_nature.js";
import { WOOD, STONE, GOLD, FIRE, ARCANE, painted, block, timber, leafMass, sprig, road, lantern, flame, smoke, crystal, orbit } from "./_settlement.js";

export const meta = {
  name: "Ember Camp",
  desc: "余烬营地：暮色空谷中的营火、帆布帐篷、补给木箱与告示板，羽翼圣像守着符文传送门，萤火虫在林间起落。A firelit sanctuary of canvas, bronze and drifting woodland magic.",
  tags: ["map", "camp", "home", "tent", "campfire", "portal", "fireflies", "营地", "帐篷", "篝火", "传送门", "萤火虫", "fantasy", "loop"],
  kind: "map", size: [320, 180], origin: [0, 0], duration: 12, loop: true, fps: 30, bg: "dark",
  options: { palette: ["#141126", "#241a3e", "#38294f", "#54406b", "#7d5f86", "#b98a8e", "#e8b98a", "#ffe9b8"], seed: 1 },
};
export const map = {
  groundY: 150, bounds: [8, 312], walk: [[8, 312]], platforms: [],
  spawns: { hero: [96, 150], mobs: [[180, 150], [236, 150]], boss: [282, 150] },
  arena: { x0: 8, x1: 312, groundY: 150 },
};
const D = meta.duration;
const CANVAS = ["#2a2036", "#4a3450", "#74506a", "#a06e86", "#c99a9e", "#eec3a0", "#ffe9c4"].map(hex);
const IRON = ["#141420", "#26283a", "#3e4056", "#5a5c74", "#82849a", "#b4b6c8", "#e8eaf4"].map(hex);

function hollow(p, C, seed) {
  sky(p, 320, 142, hex("#0e0b20"), hex("#4a2f52"), { horizon: 142, steps: 7, seed });
  stars(p, 320, 142, seed, 80, 96, "#cfc4ff");
  moon(p, 236, 40, 13, hex("#f6e3b8"), hex("#c98a5a"), seed);
  // two far ridges, then a dark treeline behind the clearing
  ridge(p, 320, 118, 26, hex("#241c3e"), seed, 1);
  ridge(p, 320, 128, 18, hex("#1c1634"), seed + 5, 1);
  for (let i = 0; i < 9; i++) {
    const x = i * 38 + rand(seed, i, 1) * 16 - 8, h = 42 + rand(seed, i, 2) * 34;
    const c = mix(hex("#2c2444"), C[2], 0.35);
    limb(p, [[x, 128], [x - 3, 128 - h * 0.55], [x + 5, 128 - h]], 5, 1, [c, c, c, c, c], { bark: false });
    foliage(p, x + 2, 128 - h + 2, 20 + rand(seed, i, 3) * 8, 11 + rand(seed, i, 4) * 4, [c, mix(c, C[3], 0.3), mix(c, C[4], 0.35), mix(c, C[5], 0.3), mix(c, C[6], 0.25)], seed + i * 7);
  }
  // a pale stream glinting between the far trees
  p.poly(contour([[118, 122], [140, 124], [132, 130], [158, 134], [142, 138], [112, 138], [136, 132], [116, 128], [124, 124]]), hex("#4a5a78"));
  p.line(126, 127, 134, 127, hex("#8a90b8"));
  p.line(128, 134, 148, 134, hex("#6a7098"));
  // the great hollow tree on the left, its roots swallowing the bank
  const B = [WOOD[0], WOOD[1], WOOD[2], WOOD[3], WOOD[4]];
  limb(p, [[-4, 152], [12, 120], [6, 78], [26, 38], [52, -6]], 30, 9, B, { seed });
  limb(p, [[12, 84], [44, 54], [92, 42], [120, 16]], 14, 2, B, { seed: seed + 4 });
  limb(p, [[14, 56], [-2, 34], [-16, 12]], 13, 4, B, { seed: seed + 6 });
  limb(p, [[316, 156], [304, 124], [312, 88], [300, 52], [310, 8]], 18, 5, B, { seed: seed + 9 });
  limb(p, [[306, 84], [282, 56], [252, 44], [236, 22]], 10, 2, B, { seed: seed + 11 });
  for (const [i, q] of [[0, [20, 4, 74, 30]], [1, [80, 0, 56, 26]], [2, [126, -2, 34, 16]], [3, [296, 8, 62, 32]], [4, [252, 2, 38, 20]]]) {
    leafMass(p, ...q, C, seed + i * 14);
  }
  // fireflies resting in the canopy as baked pinpricks; the live swarm adds motion
  for (let i = 0; i < 16; i++) {
    const x = 20 + rand(seed, i, 40) * 280, y = 30 + rand(seed, i, 41) * 80;
    p.dot(x, y, hex("#ffe9a0"), 0.8);
    p.glow(x, y, 4, hex("#ffcf6a"), 0.14);
  }
  // roots and stones frame the near plane without hiding the walking strip
  limb(p, [[2, 152], [20, 166], [58, 176]], 14, 1, WOOD.slice(0, 5), { seed: seed + 3 });
  leafMass(p, 4, 180, 26, 13, C, seed + 17);
  leafMass(p, 314, 180, 24, 12, C, seed + 23);
  for (const [x, y] of [[30, 168], [282, 172], [306, 160]]) {
    rock(p, x, y, 8 + rand(seed, x, 1) * 6, 4 + rand(seed, x, 2) * 3, STONE.slice(0, 5), { seed: seed + x, moss: [C[3], C[4]] });
  }
  // hanging moss and vines off the left tree
  for (let i = 0; i < 6; i++) {
    const x = 26 + i * 5, y = 40 + i * 9;
    p.polyline(contour([[x, y], [x + 2, y + 12], [x - 1, y + 22]]), C[2]);
    sprig(p, x - 1, y + 18, 1.1, C, seed + i);
  }
}

function tent(p, x, baseY) {
  // a ridge tent: dark guy ropes, canvas fly with a lit seam, a rolled bedroll at the door
  p.ellipse(x, baseY + 2, 26, 4, WOOD[0]);
  painted(p, [[x - 24, baseY + 1], [x - 8, baseY - 34], [x + 10, baseY - 30], [x + 26, baseY - 2], [x + 24, baseY + 1]], CANVAS, 21, -0.5);
  p.poly([[x - 10, baseY - 33], [x - 2, baseY - 38], [x + 8, baseY - 32], [x + 2, baseY - 28]], CANVAS[5]);
  p.polyline(contour([[x - 24, baseY - 1], [x - 4, baseY - 33], [x + 14, baseY - 27], [x + 26, baseY - 3]]), CANVAS[3]);
  for (let i = 0; i < 9; i++) {
    const u = i / 8, px = x - 22 + u * 46, py = baseY - 2 - Math.sin(u * Math.PI) * 30;
    p.px(px, py, CANVAS[2]);
  }
  // guy ropes and pegs
  for (const [rx, ry] of [[-30, 3], [30, 2]]) {
    p.line(x + rx * 0.8, baseY - 16, x + rx, baseY + ry, WOOD[3]);
    p.px(x + rx, baseY + ry, GOLD[3]);
  }
  // open flap, dark inside, a warm blanket
  p.poly([[x + 8, baseY - 26], [x + 22, baseY - 8], [x + 10, baseY - 4], [x + 6, baseY - 18]], WOOD[0]);
  painted(p, [[x + 11, baseY - 22], [x + 18, baseY - 12], [x + 11, baseY - 9]], ARCANE, 5);
  p.polyline([[x + 12, baseY - 20], [x + 17, baseY - 13]], ARCANE[4]);
  // bedroll and pack beside the door
  p.ellipse(x - 30, baseY - 2, 7, 3, CANVAS[3]);
  p.ellipse(x - 30, baseY - 4, 6, 2.4, CANVAS[5]);
  p.rect(x - 34, baseY - 5, 8, 2, GOLD[3]);
  painted(p, [[x - 44, baseY - 8], [x - 38, baseY - 16], [x - 30, baseY - 9], [x - 42, baseY - 4]], WOOD, 9);
  p.line(x - 36, baseY - 13, x - 33, baseY - 6, GOLD[4]);
}

function campKit(p, C, seed) {
  // crates and a barrel under a lean-to of lashed poles
  painted(p, [[30, 132], [44, 128], [48, 150], [34, 154]], WOOD, seed, -0.4);
  block(p, 29, 127, 18, 3, WOOD[4], 4);
  painted(p, [[48, 138], [58, 136], [60, 152], [50, 154]], WOOD, seed + 3, -0.6);
  p.line(34, 134, 56, 136, WOOD[4]); p.line(36, 144, 57, 144, WOOD[3]);
  p.ellipse(66, 149, 6, 8, WOOD[2]);
  p.ellipse(66, 141, 6, 3, WOOD[3]);
  p.line(60, 146, 72, 146, GOLD[3]); p.line(60, 150, 72, 150, GOLD[2]);
  // notice board: two posts, a plank, pinned notes and a lantern hook
  for (const x of [196, 214]) timber(p, [[x, 118], [x + (x < 205 ? 1 : -1), 148]], 2.4);
  painted(p, [[192, 112], [220, 110], [222, 120], [194, 122]], WOOD, 12, 0.2);
  p.polyline([[194, 113], [218, 111]], WOOD[5]);
  for (const [nx, ny, nc] of [[200, 114, "#e8dcc0"], [208, 115, "#c8d8e8"], [214, 113, "#e8c8a8"]]) {
    p.rect(nx, ny, 5, 6, hex(nc));
    p.line(nx + 1, ny + 2, nx + 4, ny + 2, WOOD[1]); p.line(nx + 1, ny + 4, nx + 3, ny + 4, WOOD[1]);
    p.px(nx + 2, ny, GOLD[4]);
  }
  // bedroll and waterskin by the fire
  p.ellipse(128, 147, 9, 3.4, CANVAS[4]);
  p.ellipse(128, 145, 8, 2.6, CANVAS[6]);
  p.rect(121, 145, 14, 2, GOLD[3]);
  p.ellipse(140, 148, 4, 5, hex("#6a4a30"));
  p.ellipse(140, 144, 4, 1.6, hex("#8a6a44"));
  p.line(137, 148, 143, 148, GOLD[3]);
}

function portalShrine(p, C, seed) {
  // a standing-stone ring around a violet well, aligned with the adventure gate
  p.ellipse(278, 141, 30, 5, WOOD[0]);
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI + (i / 10) * Math.PI * 2, x = 278 + Math.cos(a) * 26, y = 128 + Math.sin(a) * 20;
    const r = 4 + i % 3;
    painted(p, [[x - r, y - 5], [x + r - 2, y - 7], [x + r, y + 2], [x - r + 2, y + 5]], STONE, seed + i);
    p.line(x - 2, y - 4, x, y - 1, GOLD[3]);
    if (i % 3 === 0) p.px(x + 1, y - 2, ARCANE[4]);
  }
  for (const side of [-1, 1]) {
    const x = 278 + side * 30;
    painted(p, [[x - 6, 142], [x - 5, 108], [x, 92], [x + 5, 111], [x + 6, 142]], STONE, 8);
    p.poly([[x, 100], [x + 2, 112], [x, 118], [x - 2, 113]], GOLD[3]);
    p.line(x - 3, 122, x - 3, 137, STONE[4]);
    // a small winged feather sigil on each pillar
    p.poly([[x - 2, 122], [x + side * 5, 117], [x + side * 7, 120], [x + side * 3, 124]], GOLD[4]);
  }
  block(p, 246, 141, 64, 5, STONE, 14); block(p, 240, 146, 76, 4, STONE, 15);
  crystal(p, 278, 66, 5, 13);
  // pennants on the pillars
  for (const [x, col] of [[247, ARCANE[3]], [309, ARCANE[2]]]) {
    timber(p, [[x, 108], [x + (x < 278 ? 2 : -2), 96]], 1.6, GOLD);
    p.poly([[x + (x < 278 ? 2 : -2), 96], [x + (x < 278 ? 9 : -9), 99], [x + (x < 278 ? 2 : -2), 104]], col);
  }
  sprig(p, 240, 150, 2, C, seed); sprig(p, 316, 151, 2.2, C, seed + 9);
}

function statue(p) {
  // a small winged shrine figure beside the portal, echoing the old camp's guardian
  p.ellipse(238, 143, 12, 3, WOOD[0]);
  block(p, 228, 139, 22, 5, STONE, 3); block(p, 232, 133, 14, 7, STONE, 4);
  painted(p, contour([[234, 118], [238, 110], [244, 112], [246, 122], [242, 128], [234, 126]]), STONE, 6, 0.4);
  for (const side of [-1, 1]) {
    painted(p, contour([[236 + side * 2, 114], [236 + side * 9, 108], [236 + side * 13, 98], [236 + side * 15, 96], [236 + side * 12, 116], [236 + side * 6, 122]]), STONE, 9, side < 0 ? 0.3 : -0.3);
  }
  p.poly([[235, 104], [239, 101], [243, 106], [242, 113], [237, 115], [234, 110]], STONE[4]);
  p.polyline([[234, 112], [233, 107], [235, 103], [239, 102], [242, 107], [243, 114]], GOLD[3]);
  p.px(240, 106, FIRE[3]); p.glow(240, 108, 8, FIRE[2], 0.16);
}

function build(C, seed) {
  return bake(320, 180, p => {
    hollow(p, C, seed);
    road(p, C.slice(0, 6), seed, true);
    tent(p, 74, 140);
    campKit(p, C, seed);
    statue(p);
    portalShrine(p, C, seed);
    // the campfire: a ring of stones, bound logs, a coal bed
    p.ellipse(158, 146, 17, 4.5, WOOD[0]);
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * TAU;
      rock(p, 158 + Math.cos(a) * 14, 145 + Math.sin(a) * 4, 3.6, 2.6, STONE.slice(0, 5), { seed: seed + i });
    }
    timber(p, [[150, 144], [167, 146]], 3); timber(p, [[151, 147], [166, 143]], 3);
    p.ellipse(158, 144, 9, 2.6, hex("#3a1410"));
    for (let i = 0; i < 6; i++) p.px(152 + rand(seed, i, 55) * 13, 143 + rand(seed, i, 56) * 2, i % 2 ? FIRE[2] : FIRE[3]);
    // a bedroll and waterskin already placed in campKit; add a second small tent far left
    // foreground framing: roots, leaves, stones
    limb(p, [[4, 154], [22, 168], [60, 178]], 15, 1, WOOD.slice(0, 5), { seed: seed + 8 });
    leafMass(p, 318, 178, 22, 11, C, seed + 29);
    for (const [x, y] of [[18, 172], [44, 179], [296, 176]]) sprig(p, x, y, 2.1, C, seed + x);
    // warm light shafts through the canopy onto the fire
    p.glowLine(120, 20, 150, 120, 6, hex("#ffd9a0"), 0.06);
    p.glowLine(190, 26, 172, 118, 4, hex("#ffc890"), 0.05);
    p.glow(158, 138, 26, FIRE[2], 0.14);
  });
}

export function create(o) {
  const C = fit(o.palette, 8), seed = o.seed ?? 1, layer = build(C, seed);
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      const localTime = Math.round((t % D) * 1e6) / 1e6;
      const u = (localTime % D) / D, ph = u * TAU;
      blit(p, layer);
      mist(p, localTime, D, { y0: 70, y1: 130, color: "#6a5a8a", seed, bands: 2, alpha: 0.07 });
      // the campfire breathes
      flame(p, 158, 142, ph, 0.95);
      smoke(p, 158, 122, u, seed, { count: 7, rise: 40, spread: 6 });
      lantern(p, 222, 116, ph, 0.8);
      lantern(p, 188, 122, ph + 1.4, 0.62);
      // the portal well swirls violet into teal
      p.ellipse(278, 128, 15, 26, (d, a) => {
        const wave = Math.sin(a * 3 + d * 13 - ph * 2);
        return ARCANE[d > 0.91 ? 4 : d > 0.8 ? 3 : wave > 0.75 ? 2 : wave > 0.15 ? 1 : 0];
      });
      orbit(p, 278, 128, 15, 25, ph);
      p.glow(278, 128, 22, ARCANE[3], 0.15); p.glow(278, 138, 18, ARCANE[4], 0.1);
      // rising sparks off the fire and the well
      for (let i = 0; i < 9; i++) {
        const q = (u * 3 + i / 9) % 1, x = 146 + rand(seed, i, 60) * 26 + Math.sin(ph + i) * 4;
        const y = 132 + rand(seed, i, 61) * 10 - q * 22;
        p.dot(x, y, FIRE[3], Math.sin(q * Math.PI) * 0.55);
      }
      for (let i = 0; i < 6; i++) {
        const q = (u * 4 + i / 6) % 1;
        p.dot(268 + Math.sin(q * 8 + i) * 8 * q, 118 - q * 26, ARCANE[4], Math.sin(q * Math.PI) * 0.5);
      }
      fireflies(p, localTime, D, { count: 15, x0: 14, x1: 306, y0: 60, y1: 142, color: "#ffe9a0", seed: seed + 3 });
      motes(p, localTime, D, { count: 18, color: "#e8d8b0", seed: seed + 7, y0: 90, y1: 148 });
    },
  };
}
