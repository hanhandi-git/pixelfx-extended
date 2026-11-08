// A compact service street: striped general store, forge, synthesis bench and cloaked informant.
import { fit, hex, mix, rand, TAU } from "../../core/index.js";
import { bake, blit, sky, ridge } from "./_lib.js";
import { WOOD, STONE, FIRE, boards, roof, window, lantern, flame, smoke, street } from "./_settlement.js";

export const meta = {
  name: "Hearth Town",
  desc: "城镇：商店、铁匠铺、合成台与情报员。A lantern-lit service street with a stocked striped shop, a smoking forge and anvil, a crystal synthesis bench and a cloaked informant.",
  tags: ["map", "town", "shop", "blacksmith", "forge", "crafting", "synthesis", "informant", "城镇", "商店", "铁匠铺", "合成台", "情报员", "fantasy", "loop"],
  kind: "map", size: [320, 180], origin: [0, 0], duration: 12, loop: true, fps: 30, bg: "dark",
  options: { palette: ["#232430", "#393a48", "#555462", "#7f7478", "#ab9790", "#cfb49c", "#e6c99d", "#ffe5b2"], seed: 1 },
};

export const map = {
  groundY: 150, bounds: [8, 312], walk: [[8, 312]], platforms: [],
  spawns: { hero: [110, 150], mobs: [[213, 150], [267, 150]], boss: [293, 150] },
  arena: { x0: 8, x1: 312, groundY: 150 },
};

const D = meta.duration, TEAL = ["#183c49", "#286575", "#48a7a8", "#9ee4ce", "#e0ffe1"].map(hex);
const TILE = ["#252535", "#493e51", "#70566b", "#a77a82"].map(hex);

function shop(p, C) {
  p.rect(12, 75, 88, 65, C[3]); p.rect(15, 78, 82, 60, C[4]);
  for (const x of [15, 55, 95]) { p.rect(x, 75, 3, 65, WOOD[1]); p.rect(x, 75, 1, 65, WOOD[3]); }
  p.line(17, 79, 52, 99, WOOD[2]); p.line(58, 97, 94, 78, WOOD[2]);
  p.rect(14, 99, 84, 3, WOOD[1]);
  roof(p, 10, 48, 91, 29, TILE);
  window(p, 30, 82, 14, 16); window(p, 68, 82, 14, 16);
  // A dark recessed stall and scalloped teal-and-cream awning.
  p.rect(22, 106, 64, 25, WOOD[0]);
  p.poly([[15, 102], [93, 102], [99, 113], [9, 113]], WOOD[0]);
  for (let i = 0; i < 10; i++) {
    const x = 16 + i * 7.5;
    p.poly([[x, 102], [x + 7, 102], [x + 10, 111], [x - 3, 111]], i % 2 ? C[6] : TEAL[1]);
    p.rect(x - 3, 111, 12, 4, i % 2 ? C[5] : TEAL[0]);
    p.line(x - 2, 115, x + 7, 115, i % 2 ? C[6] : TEAL[2]);
  }
  for (const x of [13, 93]) { p.rect(x, 114, 2, 27, WOOD[1]); p.px(x, 114, WOOD[4]); }
  boards(p, 21, 129, 66, 11);
  p.rect(19, 127, 70, 3, WOOD[4]); p.rect(20, 130, 68, 1, WOOD[0]);
  for (const [x, c] of [[27, TEAL[2]], [35, FIRE[2]], [43, TEAL[3]]]) {
    p.rect(x, 120, 4, 7, c); p.rect(x + 1, 117, 2, 3, c); p.rect(x + 1, 116, 2, 1, WOOD[4]);
    p.px(x + 1, 121, STONE[5]);
  }
  p.ellipse(68, 125, 10, 3, WOOD[2]);
  for (let i = 0; i < 6; i++) p.circle(62 + i % 3 * 5, 122 - Math.floor(i / 3) * 3, 2, i % 2 ? FIRE[2] : hex("#a8b66a"));
  p.rect(17, 77, 2, 15, WOOD[0]); p.rect(4, 85, 19, 13, WOOD[1]);
  p.rect(5, 86, 17, 10, WOOD[3]);
  // A coin and pouch emblem makes the store sign readable without tiny lettering.
  p.poly([[10, 89], [16, 89], [18, 94], [8, 94]], FIRE[3]); p.line(11, 88, 15, 88, FIRE[4]);
}

function smithy(p, C) {
  p.rect(124, 79, 77, 60, C[1]);
  p.rect(127, 82, 71, 56, C[2]);
  p.rect(174, 43, 17, 48, STONE[1]); p.rect(174, 43, 3, 48, STONE[2]);
  for (let y = 45; y < 83; y += 6) {
    p.rect(175, y, 15, 1, STONE[0]); p.rect(y % 12 ? 181 : 185, y + 1, 1, 5, STONE[0]);
  }
  p.rect(171, 40, 23, 4, STONE[2]); p.rect(172, 40, 21, 1, STONE[4]);
  roof(p, 120, 61, 83, 22, [STONE[0], STONE[1], STONE[2], STONE[3]]);
  p.rect(126, 83, 3, 57, WOOD[1]); p.rect(198, 83, 3, 57, WOOD[1]);
  p.rect(128, 88, 69, 3, WOOD[1]);
  p.rect(170, 102, 25, 34, STONE[1]); p.rect(169, 101, 27, 3, STONE[3]);
  for (let row = 0; row < 4; row++) {
    p.rect(170, 107 + row * 6, 25, 1, STONE[0]);
    p.rect(173 + row % 2 * 6, 104 + row * 6, 1, 3, STONE[2]);
    p.rect(191, 104 + row * 6, 2, 2, STONE[2]);
  }
  p.ellipse(182, 115, 9, 11, STONE[0]); p.rect(173, 114, 18, 15, STONE[0]);
  p.rect(171, 131, 24, 6, STONE[2]); p.rect(170, 131, 26, 1, STONE[4]);
  p.rect(173, 128, 19, 2, FIRE[0]);
  for (let i = 0; i < 5; i++) p.rect(174 + i * 3.5, 128, 2, 2, FIRE[2 + i % 2]);
  for (const [x, y] of [[134, 96], [146, 94], [157, 97]]) {
    p.rect(x - 1, y + 4, 3, 11, STONE[2]);
    p.line(x, y, x, y + 17, STONE[2]); p.line(x - 3, y + 2, x + 3, y + 2, STONE[4]);
    p.line(x - 1, y + 4, x - 1, y + 13, STONE[4]); p.px(x, y + 18, WOOD[3]);
  }
  // An unmistakable horn, waist and broad foot on a wood block.
  boards(p, 138, 130, 20, 10);
  p.poly([[132, 119], [163, 119], [158, 123], [152, 124], [151, 128], [157, 130], [139, 130], [144, 126], [142, 123]], STONE[1]);
  p.line(132, 118, 163, 118, STONE[4]); p.line(136, 120, 158, 120, STONE[3]);
  p.rect(145, 123, 5, 4, STONE[2]); p.line(140, 129, 156, 129, STONE[3]);
  p.line(136, 119, 132, 124, STONE[2]);
  p.line(154, 116, 160, 111, WOOD[4]); p.poly([[157, 108], [160, 106], [165, 111], [162, 114]], STONE[3]);
  // A hanging hammer sign.
  p.line(117, 86, 132, 86, WOOD[1]); p.line(119, 86, 119, 92, WOOD[2]);
  p.rect(111, 92, 17, 15, WOOD[1]); p.line(116, 104, 123, 96, WOOD[4]); p.line(116, 95, 122, 100, STONE[4]);
}

function workbench(p) {
  p.ellipse(236, 142, 23, 3, STONE[0]);
  p.rect(216, 128, 3, 14, WOOD[1]); p.rect(250, 128, 3, 14, WOOD[1]);
  p.rect(218, 137, 33, 2, WOOD[2]);
  boards(p, 214, 126, 42, 6); p.rect(212, 125, 46, 2, WOOD[4]);
  // Circular inlay, mortar, reagent flasks and an open recipe book.
  p.ellipse(235, 123, 10, 2.5, TEAL[0]); p.ellipse(235, 122, 8, 1.5, TEAL[2]);
  p.poly([[215, 119], [223, 118], [229, 121], [229, 125], [222, 122], [215, 123]], STONE[5]);
  p.line(222, 119, 222, 122, WOOD[3]);
  p.rect(247, 118, 4, 7, TEAL[2]); p.rect(248, 115, 2, 3, STONE[4]);
  p.circle(254, 122, 3, FIRE[1]); p.rect(253, 117, 2, 3, FIRE[3]);
  p.rect(217, 133, 6, 3, TEAL[0]); p.rect(226, 133, 20, 2, WOOD[3]);
}

function informant(p) {
  // A noticeboard behind a seated hooded contact; the parchment remains bright against the cloak.
  p.rect(266, 104, 3, 35, WOOD[1]); boards(p, 258, 94, 21, 23);
  p.rect(261, 98, 7, 11, STONE[5]); p.rect(270, 102, 6, 10, WOOD[5]);
  for (let i = 0; i < 3; i++) p.line(262, 101 + i * 2, 266, 101 + i * 2, WOOD[3]);
  p.px(273, 104, FIRE[0]);
  p.ellipse(293, 142, 13, 3, STONE[0]);
  p.rect(283, 132, 21, 3, WOOD[2]); p.rect(286, 134, 2, 8, WOOD[1]); p.rect(300, 134, 2, 8, WOOD[1]);
  p.poly([[286, 116], [298, 115], [304, 134], [282, 134]], TEAL[0]);
  p.poly([[285, 117], [289, 121], [287, 133], [282, 134]], TEAL[1]);
  p.poly([[285, 115], [287, 105], [292, 101], [298, 106], [300, 115]], TEAL[0]);
  p.poly([[288, 112], [292, 107], [296, 111], [296, 117], [288, 117]], WOOD[0]);
  p.rect(289, 113, 6, 4, WOOD[3]); p.px(293, 113, STONE[5]);
  p.line(285, 121, 291, 125, TEAL[2]); p.line(299, 120, 295, 125, TEAL[1]);
  p.poly([[289, 123], [299, 122], [300, 129], [290, 130]], STONE[5]);
  p.line(292, 125, 297, 125, WOOD[3]); p.line(292, 127, 296, 127, WOOD[3]);
  p.rect(286, 134, 4, 6, WOOD[0]); p.rect(296, 134, 4, 6, WOOD[0]);
  p.rect(284, 139, 7, 2, WOOD[1]); p.rect(295, 139, 7, 2, WOOD[1]);
}

function build(C, seed) {
  return bake(320, 180, p => {
    sky(p, 320, 180, hex("#28374a"), hex("#c5a29b"), { horizon: 132 });
    ridge(p, 320, 111, 25, "#536173", seed);
    for (let i = 0; i < 9; i++) {
      const x = i * 41 - 12, y = 84 + rand(seed, i, 1) * 17;
      p.rect(x, y, 32, 42, C[1]);
      p.poly([[x - 4, y], [x + 15, y - 16 - i % 3 * 3], [x + 36, y]], C[1]);
      for (let j = 0; j < 2; j++) p.rect(x + 7 + j * 13, y + 12, 3, 5, C[3]);
    }
    p.rect(0, 128, 320, 22, C[2]);
    for (let row = 0; row < 3; row++) for (let x = row % 2 * 6; x < 320; x += 15) {
      p.line(x, 135 + row * 5, x + 11, 135 + row * 5, mix(C[2], C[3], 0.35));
    }
    shop(p, C); smithy(p, C); workbench(p); informant(p);
    // A street lamp frames the informant, with room around the hood silhouette.
    p.rect(309, 78, 2, 65, STONE[0]); p.line(299, 79, 310, 79, STONE[2]);
    p.line(308, 80, 310, 82, STONE[2]); p.rect(306, 142, 8, 3, STONE[1]);
    street(p, [C[0], C[1], C[2], C[3], C[4]], seed);
  });
}

export function create(o) {
  const C = fit(o.palette, 8), seed = o.seed ?? 1, layer = build(C, seed);
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      const u = (t % D) / D, ph = u * TAU;
      blit(p, layer);
      smoke(p, 182, 39, u, seed, { rise: 30, spread: 8 });
      flame(p, 182, 127, ph, 0.65);
      lantern(p, 102, 104, ph); lantern(p, 299, 82, ph + 1);
      // Synthesis crystal bobs over its inlaid circle, with orbiting reagent motes.
      const y = 109 + Math.sin(ph * 2) * 1.5;
      p.poly([[235, y - 9], [241, y], [235, y + 8], [229, y]], TEAL[1]);
      p.poly([[235, y - 9], [235, y + 8], [229, y]], TEAL[2]);
      p.poly([[235, y - 9], [235, y], [231, y - 1]], TEAL[3]);
      p.line(235, y - 8, 236, y - 2, TEAL[4]);
      for (let i = 0; i < 3; i++) {
        const a = ph * 2 + i / 3 * TAU;
        p.px(235 + Math.cos(a) * 11, y + Math.sin(a) * 4, TEAL[3]);
      }
      p.glow(235, y, 18, TEAL[2], 0.2 + Math.sin(ph * 2) * 0.03);
      p.glow(235, 124, 11, TEAL[3], 0.1);
      // A small, steady question-mark token identifies the intelligence contact.
      p.text("?", 291, 91, C[6], { font: "mini" });
      for (let i = 0; i < 5; i++) {
        const q = (u * 5 + i / 5) % 1;
        p.dot(180 + Math.sin(i * 2 + q * 5) * q * 7, 124 - q * 17, FIRE[3], Math.sin(q * Math.PI) * 0.65);
      }
    },
  };
}
