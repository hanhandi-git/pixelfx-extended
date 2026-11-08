// A sanctuary grown into ancient roots: warm velvet, bronze fittings and a distant sunlit forest.
import { fit, hex, mix, rand, TAU } from "../../core/index.js";
import { bake, blit } from "./_lib.js";
import { limb, contour, rock } from "./_nature.js";
import { WOOD, STONE, GOLD, FIRE, ARCANE, painted, block, timber, leafMass, sprig, road, lantern, flame, smoke, crystal, orbit } from "./_settlement.js";

export const meta = {
  name: "Starter Camp",
  desc: "初始营地：古树下的耕地、帷帐床铺、储物柜与篝火，羽翼圣像守护着符文传送门。A lush sanctuary of velvet, carved stone, bronze and drifting woodland magic.",
  tags: ["map", "camp", "home", "farm", "bed", "campfire", "storage", "statue", "portal", "初始营地", "耕地", "床", "篝火", "储物柜", "圣像", "传送门", "fantasy", "loop"],
  kind: "map", size: [320, 180], origin: [0, 0], duration: 12, loop: true, fps: 30, bg: "dark",
  options: { palette: ["#111f2d", "#203b3a", "#345344", "#52734e", "#7e9d62", "#abc17e", "#d8d9a1", "#f7e8b5"], seed: 1 },
};
export const map = {
  groundY: 150, bounds: [8, 312], walk: [[8, 312]], platforms: [],
  spawns: { hero: [127, 150], mobs: [[185, 150], [244, 150]], boss: [284, 150] },
  arena: { x0: 8, x1: 312, groundY: 150 },
};
const D = meta.duration;
const VELVET = ["#251e31", "#492333", "#76333f", "#a54b4a", "#ce7860", "#eeb284", "#ffe0a4"].map(hex);

function forest(p, C, seed) {
  // Saturated foreground framing, with a light opening far beyond the settlement.
  p.shade(0, 0, 320, 140, (x, y) => {
    const light = Math.max(0, 1 - Math.hypot((x - 175) / 190, (y - 40) / 140));
    return mix(hex("#24494f"), hex("#d2d6a0"), Math.floor(light * 9) / 9);
  });
  for (let layer = 0; layer < 3; layer++) {
    const base = 111 + layer * 10, c = mix(hex("#73988a"), C[1], layer * 0.23);
    for (let i = 0; i < 8; i++) {
      const x = i * 49 + rand(seed, i, layer) * 15 - 14, h = 48 + rand(seed, i, 8 + layer) * 40;
      limb(p, [[x, base], [x - 3, base - h * 0.5], [x + 7, base - h]], 5 + layer * 2, 1, [c, c, c, c, c], { bark: false });
      const F = [c, c, mix(c, C[3], 0.15), mix(c, C[4], 0.15), mix(c, C[5], 0.15)];
      leafMass(p, x, base - h + 3, 35, 19, F, seed + i * 4 + layer);
    }
  }
  // A pale stream and mossy terraces recede through the centre opening.
  p.poly(contour([[153, 93], [177, 97], [166, 108], [194, 117], [177, 127], [146, 127], [174, 116], [154, 108], [163, 99]]), hex("#628c83"));
  p.line(164, 103, 173, 103, hex("#a6c4aa")); p.line(162, 115, 181, 115, hex("#8bad9a"));
  for (const [x, y, w, h] of [[122, 124, 31, 8], [191, 124, 28, 11], [165, 127, 15, 6]]) {
    rock(p, x, y, w / 2, h, C.slice(0, 5), { seed: seed + x, moss: [C[3], C[4]] });
  }
  // Half-buried old shrine columns give the woodland clearing a history.
  const mossStone = STONE.map((c, i) => mix(c, C[Math.min(i, 5)], 0.6));
  for (const [x, y] of [[142, 93], [182, 84]]) {
    painted(p, [[x, 125], [x + 1, y], [x + 5, y - 2], [x + 8, y + 2], [x + 7, 125]], mossStone, seed + x, -0.4);
    p.line(x + 2, y + 4, x + 2, 121, mossStone[4]);
    block(p, x - 2, y - 2, 12, 4, mossStone, seed + x);
    for (let i = 0; i < 3; i++) p.line(x + 1, y + 9 + i * 7, x + 7, y + 8 + i * 7, mossStone[1]);
    sprig(p, x + 3, 127, 1.8, C, seed + x);
  }
  const B = [WOOD[0], WOOD[1], WOOD[2], WOOD[3], WOOD[4]];
  limb(p, [[9, 145], [19, 111], [13, 70], [29, 35], [51, -7]], 25, 8, B, { seed });
  limb(p, [[17, 79], [52, 48], [99, 35], [126, 12]], 13, 2, B, { seed: seed + 4 });
  limb(p, [[18, 51], [3, 31], [-5, 10]], 12, 4, B, { seed: seed + 6 });
  limb(p, [[319, 151], [306, 117], [315, 78], [304, 42], [314, -8]], 21, 6, B, { seed: seed + 9 });
  limb(p, [[310, 72], [284, 42], [253, 30], [237, 6]], 11, 2, B, { seed: seed + 11 });
  for (const [i, q] of [[0, [21, 9, 70, 33]], [1, [78, 8, 53, 27]], [2, [120, 2, 35, 18]], [3, [298, 9, 65, 34]], [4, [254, 5, 40, 22]]]) {
    leafMass(p, ...q, C, seed + i * 14);
  }
  for (let i = 0; i < 7; i++) {
    const x = 24 + i * 9, y = 22 + Math.sin(i * 2) * 8;
    p.polyline(contour([[x, y], [x + 3, y + 12], [x - 2, y + 24]]), C[2]);
    sprig(p, x - 1, y + 20, 1.2, C, seed + i);
  }
}

function pavilion(p) {
  p.ellipse(65, 131, 43, 5, WOOD[0]);
  painted(p, [[26, 98], [50, 63], [95, 77], [109, 125], [27, 126]], VELVET, 7, -1);
  p.poly([[36, 93], [64, 72], [91, 96], [95, 125], [33, 125]], WOOD[0]);
  p.poly([[39, 105], [83, 102], [91, 124], [35, 126]], hex("#30242d"));
  // Curved tent fly, gold borders and a heavy gathered curtain.
  const roof = contour([[19, 96], [34, 74], [48, 62], [57, 53], [65, 61], [84, 69], [105, 93], [113, 96], [76, 90], [47, 94]]);
  painted(p, roof, VELVET, 12, 0.7);
  p.polyline(contour([[19, 96], [48, 92], [77, 90], [113, 96]]), GOLD[4]);
  for (let i = 0; i < 13; i++) {
    const x = 25 + i * 6.2, y = 92 + Math.abs(x - 70) * 0.06;
    p.poly([[x - 2, y], [x + 2, y], [x, y + 4]], GOLD[3]);
    p.px(x, y + 4, GOLD[5]);
  }
  p.poly([[59, 67], [63, 73], [59, 81], [55, 75]], GOLD[3]);
  p.line(59, 70, 59, 77, GOLD[5]);
  for (const x of [40, 57, 78, 96]) p.polyline(contour([[58, 58], [x - 3, 76], [x, 91]]), VELVET[2]);
  p.poly([[27, 94], [44, 92], [38, 106], [32, 113], [34, 124], [24, 125]], VELVET[3]);
  p.poly([[87, 93], [103, 95], [106, 124], [94, 126], [97, 111], [90, 105]], VELVET[2]);
  p.polyline(contour([[27, 95], [31, 109], [25, 123]]), VELVET[4]);
  p.polyline(contour([[102, 97], [99, 111], [105, 123]]), VELVET[4]);
  for (const x of [30, 99]) { p.ellipse(x, 109, 5, 1, GOLD[3]); p.line(x, 110, x - 1, 117, GOLD[4]); }
  timber(p, [[24, 94], [23, 129]], 2); timber(p, [[108, 95], [110, 129]], 2);
  p.line(23, 95, 14, 131, GOLD[2]); p.line(109, 96, 120, 132, GOLD[2]);
  p.line(57, 54, 58, 45, GOLD[4]); p.poly([[58, 44], [64, 48], [58, 51], [54, 48]], GOLD[4]);
  // The bed sits inside the warm dark recess, with a carved frame and rounded quilt.
  p.poly([[38, 116], [77, 113], [88, 118], [87, 126], [37, 127]], WOOD[2]);
  p.poly([[39, 115], [77, 112], [86, 116], [45, 120]], GOLD[5]);
  painted(p, [[50, 116], [80, 113], [88, 118], [87, 126], [51, 128]], ARCANE, 7);
  p.polyline([[51, 117], [80, 114], [86, 117]], ARCANE[4]);
  for (let i = 0; i < 4; i++) p.line(58 + i * 7, 118, 59 + i * 7, 125, ARCANE[2]);
  p.ellipse(43, 115, 6, 2.5, GOLD[5]); p.line(39, 113, 47, 113, STONE[6]);
  for (const x of [36, 86]) { p.rect(x, 116, 2, 14, WOOD[1]); p.circle(x + 1, 114, 1.8, GOLD[3]); }
  // Iron-bound cabinet beside the tent: deep side plane, twin doors, embossed hinges.
  painted(p, [[111, 101], [128, 99], [136, 104], [136, 133], [112, 136]], WOOD, 9);
  p.poly([[128, 101], [135, 104], [135, 132], [129, 134]], WOOD[1]);
  block(p, 110, 99, 20, 3, GOLD, 4);
  p.line(120, 103, 120, 133, WOOD[0]);
  for (const y of [106, 128]) { p.line(112, y, 128, y - 1, GOLD[3]); p.px(114, y - 1, GOLD[5]); p.px(126, y - 1, GOLD[5]); }
  p.ring(118, 117, 1.5, 0.7, GOLD[4]); p.ring(123, 117, 1.5, 0.7, GOLD[4]);
  p.poly([[116, 110], [119, 113], [116, 116], [113, 113]], GOLD[2]);
}

function farm(p, C, seed) {
  p.poly([[25, 135], [78, 131], [96, 149], [15, 153]], WOOD[0]);
  for (let row = 0; row < 3; row++) {
    const y = 135 + row * 5, left = 25 - row * 3, right = 79 + row * 6;
    painted(p, [[left, y], [right, y - 3], [right + 3, y], [left - 2, y + 3]], WOOD, seed + row, -0.2);
    for (let col = 0; col < 7; col++) {
      const x = left + 4 + col * (right - left - 7) / 7, cy = y - (x - left) / 20;
      sprig(p, x, cy, 0.75 + row * 0.1, C, seed + col * 3 + row);
      if ((col + row) % 3 === 0) p.ellipse(x + 1, cy - 2, 1.2, 1.4, FIRE[2]);
    }
  }
  p.poly([[92, 139], [98, 138], [102, 145], [94, 147]], STONE[2]);
  p.polyline([[95, 139], [94, 135], [99, 134], [102, 138]], STONE[4]);
  p.line(100, 142, 107, 138, STONE[4]);
}

function shrine(p) {
  p.ellipse(213, 141, 23, 5, WOOD[0]);
  block(p, 192, 138, 42, 5, STONE, 1); block(p, 198, 132, 30, 6, STONE, 2);
  block(p, 204, 124, 18, 8, STONE, 3);
  // Feathered wings grow from the shoulders; their overlapping layers have a lit front and a blue underside.
  for (const side of [-1, 1]) {
    painted(p, contour([[213 + side * 4, 101], [213 + side * 16, 94], [213 + side * 23, 80], [213 + side * 28, 77], [213 + side * 25, 100], [213 + side * 17, 112], [213 + side * 8, 114]]), STONE, 7, side < 0 ? 0.6 : -0.2);
    for (let i = 0; i < 6; i++) {
      const x = 213 + side * (9 + i * 2.6), y = 106 - i * 3.8;
      p.poly(contour([[x - side * 2, y + 2], [x + side * 4, y - 6], [x + side * 6, y - 13], [x + side * 7, y - 9], [x + side * 5, y + 3], [x, y + 8]]), STONE[side < 0 ? 4 : 3]);
      p.polyline(contour([[x, y + 4], [x + side * 4, y - 2], [x + side * 6, y - 10]]), STONE[side < 0 ? 5 : 4]);
    }
  }
  painted(p, contour([[209, 96], [217, 96], [221, 110], [225, 126], [218, 130], [202, 127], [207, 111]]), STONE, 11, 0.7);
  for (const [x, end] of [[211, 205], [214, 213], [217, 222]]) p.polyline(contour([[x, 106], [x - 1, 116], [end, 126]]), STONE[2]);
  p.poly([[209, 86], [214, 83], [219, 88], [218, 95], [212, 99], [208, 94]], STONE[3]);
  p.poly([[210, 87], [215, 86], [216, 93], [212, 96], [210, 93]], STONE[5]);
  p.polyline(contour([[209, 94], [208, 89], [210, 85], [214, 84], [218, 88], [219, 98]]), GOLD[3]);
  p.line(207, 101, 212, 103, GOLD[3]); p.line(215, 103, 221, 100, GOLD[3]);
  p.line(215, 89, 216, 91, STONE[2]);
  p.polyline([[207, 102], [209, 110], [214, 111], [220, 104]], STONE[5]);
  p.arc(214, 88, 10, 1.2, Math.PI * 0.93, TAU + 0.06, GOLD[4]);
  p.poly([[213, 103], [217, 109], [213, 115], [210, 109]], GOLD[4]);
  for (const x of [199, 228]) { p.rect(x, 128, 1.5, 5, GOLD[5]); p.px(x, 127, FIRE[3]); }
}

function portalStones(p, C, seed) {
  p.ellipse(278, 141, 28, 5, WOOD[0]);
  p.ellipse(278, 102, 26, 39, STONE[0]); p.ellipse(278, 102, 20, 34, ARCANE[0]);
  for (let i = 0; i < 13; i++) {
    const a = -Math.PI + i / 12 * Math.PI * 2, x = 278 + Math.cos(a) * 23, y = 102 + Math.sin(a) * 36;
    const r = 4 + i % 3;
    painted(p, [[x - r, y - 4], [x + r - 2, y - 6], [x + r, y + 3], [x - r + 2, y + 5]], STONE, seed + i);
    p.line(x - 2, y - 3, x, y, GOLD[3]); p.px(x + 1, y - 2, ARCANE[4]);
  }
  for (const side of [-1, 1]) {
    const x = 278 + side * 27;
    painted(p, [[x - 5, 142], [x - 4, 106], [x, 91], [x + 4, 109], [x + 5, 142]], STONE, 6);
    p.poly([[x, 99], [x + 2, 111], [x, 116], [x - 2, 111]], GOLD[3]);
    p.line(x - 3, 120, x - 3, 136, STONE[4]);
  }
  block(p, 249, 141, 58, 5, STONE, 10); block(p, 244, 146, 67, 4, STONE, 11);
  crystal(p, 278, 68, 5, 12);
  limb(p, [[307, 141], [299, 132], [304, 118]], 6, 1, C.slice(0, 5), { seed, bark: false });
  sprig(p, 252, 143, 2, C, seed); sprig(p, 305, 148, 2.2, C, seed + 9);
}

function build(C, seed) {
  return bake(320, 180, p => {
    forest(p, C, seed);
    road(p, C.slice(0, 6), seed, true);
    pavilion(p); farm(p, C, seed); shrine(p); portalStones(p, C, seed);
    // A sunken hearth of irregular stone and bound logs.
    p.ellipse(158, 145, 18, 5, WOOD[0]);
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * TAU;
      rock(p, 158 + Math.cos(a) * 13, 144 + Math.sin(a) * 4, 3.5, 2.5, STONE.slice(0, 5), { seed: seed + i });
    }
    timber(p, [[150, 143], [166, 145]], 3); timber(p, [[151, 146], [165, 142]], 3);
    // Roots and broad leaves frame the near plane without hiding the walking strip.
    limb(p, [[3, 150], [18, 161], [54, 169]], 13, 1, WOOD.slice(0, 5), { seed });
    leafMass(p, 7, 177, 24, 13, C, seed + 9); leafMass(p, 311, 177, 26, 14, C, seed + 14);
    for (const [x, y] of [[13, 165], [37, 176], [289, 176], [312, 156]]) sprig(p, x, y, 2.3, C, seed + x);
    for (const [x, y] of [[35, 162], [241, 153], [298, 161]]) {
      p.line(x, y, x - 1, y - 5, C[4]);
      for (let i = 0; i < 4; i++) p.px(x - 1 + Math.cos(i * Math.PI / 2), y - 5 + Math.sin(i * Math.PI / 2), VELVET[4]);
      p.px(x - 1, y - 5, GOLD[5]);
    }
    // Additive shafts keep their soft air without a dither grid over the background.
    p.glowLine(145, 27, 181, 130, 7, GOLD[5], 0.075);
    p.glowLine(170, 28, 194, 110, 4, GOLD[5], 0.06);
  });
}

export function create(o) {
  const C = fit(o.palette, 8), seed = o.seed ?? 1, layer = build(C, seed);
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      // Keep the same loop phase byte-stable despite accumulated floating-point time.
      const localTime = Math.round((t % D) * 1e6) / 1e6;
      const u = (localTime % D) / D, ph = u * TAU;
      blit(p, layer); smoke(p, 158, 126, u, seed); flame(p, 158, 142, ph, 0.85);
      lantern(p, 98, 96, ph, 0.75);
      p.glow(213, 110, 11, GOLD[4], 0.12 + Math.sin(ph * 2) * 0.02);
      // A deep, rotating violet-to-turquoise vortex, framed by the carved outer masonry.
      p.ellipse(278, 102, 17.5, 31, (d, a) => {
        const wave = Math.sin(a * 3 + d * 13 - ph * 2);
        return ARCANE[d > 0.91 ? 4 : d > 0.8 ? 3 : wave > 0.75 ? 2 : wave > 0.15 ? 1 : 0];
      });
      orbit(p, 278, 102, 17, 30, ph);
      p.glow(278, 102, 24, ARCANE[3], 0.16); p.glow(278, 144, 20, ARCANE[4], 0.12);
      for (let i = 0; i < 10; i++) {
        const q = (u * 3 + i / 10) % 1, x = 137 + rand(seed, i, 30) * 74 + Math.sin(ph + i) * 4;
        const y = 73 + rand(seed, i, 31) * 53 - q * 13;
        p.dot(x, y, GOLD[5], Math.sin(q * Math.PI) * 0.45);
      }
      for (let i = 0; i < 5; i++) {
        const q = (u * 5 + i / 5) % 1;
        p.dot(158 + Math.sin(q * 7 + i) * 7 * q, 136 - q * 25, FIRE[3], Math.sin(q * Math.PI) * 0.7);
      }
    },
  };
}
