// A layered fantasy service street: curved slate, warm plaster, monumental forge and brass alchemy.
import { fit, hex, mix, rand, noise2, TAU } from "../../core/index.js";
import { bake, blit } from "./_lib.js";
import { contour } from "./_nature.js";
import { WOOD, STONE, GOLD, FIRE, ARCANE, painted, block, masonry, timber, leafMass, sprig, road, lantern, flame, smoke, crystal, orbit } from "./_settlement.js";

export const meta = {
  name: "Hearth Town",
  desc: "城镇：弧檐商店、巨炉铁匠铺、悬浮晶石合成台与巷口情报员。A richly layered fantasy street of rose slate, warm plaster, brass machinery and arcane light.",
  tags: ["map", "town", "shop", "blacksmith", "forge", "crafting", "synthesis", "informant", "城镇", "商店", "铁匠铺", "合成台", "情报员", "fantasy", "loop"],
  kind: "map", size: [320, 180], origin: [0, 0], duration: 12, loop: true, fps: 30, bg: "dark",
  options: { palette: ["#202332", "#353948", "#545865", "#7d7c83", "#aba29b", "#d0baa4", "#ecd3ab", "#fff0c4"], seed: 1 },
};
export const map = {
  groundY: 150, bounds: [8, 312], walk: [[8, 312]], platforms: [],
  spawns: { hero: [109, 150], mobs: [[213, 150], [267, 150]], boss: [293, 150] },
  arena: { x0: 8, x1: 312, groundY: 150 },
};
const D = meta.duration;
const ROSE = ["#252338", "#432c47", "#684054", "#94566b", "#bd7a82", "#dfa395", "#f9cfaa"].map(hex);
const PLASTER = ["#35313e", "#665451", "#967868", "#bba080", "#dcc69b", "#f4dfb3", "#fff0c4"].map(hex);
const GREEN = ["#152d35", "#27453f", "#456548", "#6d8854", "#a1b477", "#d3d7a1"].map(hex);

function distance(p, C, seed) {
  p.shade(0, 0, 320, 139, (x, y) => {
    const k = Math.floor((y / 140 + noise2(x / 45, y / 16, seed) * 0.06) * 8) / 8;
    return mix(hex("#516c86"), hex("#e0c2a4"), k);
  });
  for (const [x, y, w, h] of [[121, 58, 13, 35], [143, 47, 16, 43], [217, 67, 15, 33], [248, 52, 12, 40], [268, 73, 13, 31]]) {
    const c = hex("#778493");
    p.poly([[x, y + h], [x, y], [x + w * 0.5, y - 18], [x + w, y], [x + w, y + h]], c);
    p.line(x + w * 0.5, y - 17, x + w * 0.5, y + h, hex("#9aa0a3"));
    for (let yy = y + 5; yy < y + h - 3; yy += 8) p.rect(x + 3, yy, 2, 4, hex("#596b80"));
  }
  for (let i = 0; i < 7; i++) {
    const x = i * 49 + 4, y = 88 + rand(seed, i, 1) * 9;
    painted(p, [[x - 5, 126], [x - 4, y], [x + 12, y - 12], [x + 33, y + 2], [x + 34, 128]], [C[1], C[2], hex("#78818a"), hex("#92959b"), C[5]], seed + i, -0.3);
  }
  p.rect(194, 101, 87, 29, hex("#6f7984"));
  for (const x of [207, 231, 255]) {
    p.ellipse(x, 119, 9, 13, hex("#a1a6a6")); p.rect(x - 9, 119, 18, 13, hex("#a1a6a6"));
    p.polyline(contour([[x - 10, 120], [x - 8, 111], [x, 106], [x + 8, 111], [x + 10, 120]]), hex("#8d9298"));
  }
  p.line(194, 100, 281, 100, hex("#b1afa9"));
  p.polyline(contour([[95, 39], [129, 49], [164, 48]]), WOOD[2]);
  for (const [x, y, c] of [[110, 44, ROSE[3]], [126, 48, GOLD[3]], [143, 49, ARCANE[2]]]) p.poly([[x, y], [x + 8, y + 1], [x + 4, y + 13]], c);
}

function curvedRoof(p, x, y, w, h, seed = 1) {
  const edge = contour([[x - 7, y + h], [x + w * 0.1, y + h * 0.78], [x + w * 0.34, y + h * 0.32], [x + w * 0.43, y], [x + w * 0.58, y + h * 0.35], [x + w * 0.86, y + h * 0.82], [x + w + 9, y + h - 3]]);
  painted(p, [...edge, [x + w + 5, y + h + 8], [x - 8, y + h + 9]], ROSE, seed, 0.3);
  // Tiles follow sloping rows, with a lit lip and shaded overlap on every course.
  for (let row = 1; row <= 7; row++) {
    const v = row / 7, yy = y + h * v, left = x + w * 0.43 * (1 - v), right = x + w * (0.43 + 0.57 * v);
    const path = contour([[left, yy + 2], [(left + right) / 2, yy - 2], [right, yy + 1]]);
    p.polyline(path, ROSE[row % 3 === 0 ? 4 : 3]);
    p.polyline(path.map(([a, b]) => [a, b + 1.1]), ROSE[1]);
    for (let tx = left + 4 + row % 2 * 3; tx < right - 1; tx += 9) {
      p.line(tx, yy - 2, tx + 1, yy + 1, ROSE[2]); p.line(tx + 1, yy - 2, tx + 3, yy - 2, ROSE[4]);
    }
  }
  p.polyline(contour([[x - 8, y + h + 7], [x + w * 0.5, y + h + 4], [x + w + 8, y + h + 4]]), WOOD[0]);
  p.polyline(contour([[x - 8, y + h + 8], [x + w * 0.5, y + h + 5], [x + w + 8, y + h + 5]]), GOLD[3]);
}

function roundWindow(p, x, y, r) {
  p.circle(x, y, r + 2, WOOD[1]); p.circle(x, y, r, GOLD[2]); p.circle(x, y, r - 1.5, FIRE[3]);
  p.circle(x - 1, y - 1, r - 3, FIRE[4]);
  p.line(x - r, y, x + r, y, WOOD[2]); p.line(x, y - r, x, y + r, WOOD[2]);
  p.arc(x, y, r + 2, 1, Math.PI, TAU, GOLD[4]);
}

function shop(p, seed) {
  p.ellipse(57, 138, 54, 6, WOOD[0]);
  // A projecting turret and receding side wall give the shop an actual footprint.
  painted(p, [[11, 77], [84, 69], [103, 83], [101, 136], [12, 141]], PLASTER, seed);
  p.poly([[84, 72], [103, 83], [101, 136], [86, 135]], PLASTER[1]);
  painted(p, [[75, 37], [90, 34], [101, 40], [98, 87], [77, 87]], PLASTER, seed + 1);
  curvedRoof(p, 72, 12, 26, 24, seed + 7);
  p.line(84, 12, 85, 5, GOLD[3]); p.poly([[85, 4], [92, 8], [86, 10]], ROSE[4]);
  curvedRoof(p, 9, 32, 82, 43, seed);
  // Scrolled copper roof ends and an enamel star add a crafted, fantastical silhouette.
  p.polyline(contour([[3, 77], [1, 72], [4, 68], [8, 71], [6, 75]]), GOLD[3]);
  p.polyline(contour([[95, 77], [101, 74], [101, 69], [97, 68], [97, 72]]), GOLD[3]);
  p.poly([[47, 62], [51, 58], [55, 62], [51, 67]], GOLD[3]); p.px(51, 62, GOLD[5]);
  roundWindow(p, 51, 86, 10); roundWindow(p, 88, 50, 5);
  for (const pts of [[[16, 83], [13, 136]], [[84, 80], [87, 135]], [[14, 102], [88, 97]], [[18, 87], [31, 98]], [[73, 85], [62, 98]]]) timber(p, pts, 3);
  masonry(p, 12, 133, 78, 8, [WOOD[0], WOOD[1], WOOD[2], WOOD[3], WOOD[4], WOOD[5]], seed);
  p.poly([[19, 108], [82, 104], [83, 130], [18, 133]], WOOD[0]);
  // Heavy scalloped cloth with copper edge, layered folds and hanging tassels.
  for (let i = 0; i < 6; i++) {
    const x = 11 + i * 13;
    const panel = contour([[x + 4, 100], [x + 16, 99], [x + 19, 111], [x + 12, 115], [x - 1, 113]]);
    painted(p, panel, i % 2 ? ROSE : GOLD, seed + i, 0.7);
    p.polyline(contour([[x - 1, 113], [x + 9, 116], [x + 19, 111]]), GOLD[4]);
    p.line(x + 10, 114, x + 10, 118, GOLD[3]);
  }
  for (const x of [13, 88]) timber(p, [[x, 111], [x - 1, 137]], 2);
  painted(p, [[19, 128], [80, 125], [89, 128], [85, 140], [19, 143]], WOOD, seed + 9);
  p.poly([[18, 127], [80, 124], [90, 127], [26, 131]], WOOD[4]);
  for (let i = 0; i < 9; i++) p.line(23 + i * 7, 132, 23 + i * 7, 140, WOOD[1]);
  p.line(20, 141, 86, 138, GOLD[2]);
  for (const [x, y, c] of [[27, 122, ARCANE[3]], [35, 121, ROSE[4]], [43, 121, ARCANE[4]]]) {
    p.ellipse(x, y + 2, 2.5, 4, c); p.rect(x - 0.7, y - 3, 1.5, 3, GOLD[4]); p.px(x - 1, y, ARCANE[5]);
  }
  // A merchant behind the counter, framed by rolled fabrics and provisions.
  p.circle(62, 119, 3, WOOD[4]); p.poly([[56, 115], [62, 110], [68, 115]], ROSE[3]);
  p.line(57, 115, 67, 115, GOLD[4]); p.poly([[59, 121], [66, 120], [69, 126], [56, 127]], ROSE[2]);
  p.ellipse(76, 122, 6, 4, GOLD[3]); p.line(71, 120, 78, 118, GOLD[5]);
  // Filigreed hanging sign with a bright coin at its centre.
  p.polyline(contour([[19, 79], [8, 78], [5, 83], [9, 86]]), GOLD[3]);
  p.line(9, 85, 9, 89, GOLD[4]);
  p.poly([[2, 91], [8, 87], [18, 90], [19, 102], [10, 105], [2, 101]], WOOD[1]);
  p.polyline([[3, 92], [8, 89], [17, 91], [18, 101]], GOLD[3]);
  p.circle(10, 97, 4, GOLD[4]); p.ring(10, 97, 2.5, 0.8, GOLD[2]);
}

function smithy(p, C, seed) {
  p.ellipse(161, 140, 47, 6, WOOD[0]);
  // A monumental chimney / crucible above a vaulted open workshop.
  painted(p, [[171, 31], [187, 30], [191, 70], [165, 73]], STONE, seed, -0.2);
  for (const y of [38, 49, 61]) {
    block(p, 167, y, 24, 4, GOLD, seed + y); p.line(171, y + 1, 185, y, GOLD[4]);
  }
  p.poly([[175, 55], [179, 52], [183, 55], [179, 59]], ARCANE[2]);
  p.line(177, 55, 179, 57, ARCANE[4]); p.px(180, 54, ARCANE[4]);
  p.poly([[163, 34], [165, 27], [193, 26], [196, 33], [190, 37], [168, 37]], STONE[1]);
  p.polyline([[165, 28], [191, 27], [195, 32]], GOLD[3]);
  for (const side of [-1, 1]) {
    p.poly([[179 + side * 13, 32], [179 + side * 20, 21], [179 + side * 17, 39], [179 + side * 11, 45]], STONE[2]);
    p.line(179 + side * 15, 32, 179 + side * 18, 25, STONE[4]);
  }
  masonry(p, 121, 84, 82, 53, [C[0], C[1], C[2], C[3], C[4], C[5]], seed);
  painted(p, contour([[114, 83], [133, 69], [174, 68], [207, 84], [204, 92], [119, 95]]), STONE, seed + 2, -0.2);
  p.polyline(contour([[114, 84], [141, 88], [181, 85], [207, 84]]), GOLD[2]);
  for (const x of [134, 154, 177, 196]) {
    p.polyline(contour([[x - 5, 74], [x - 1, 80], [x + 5, 86]]), STONE[1]);
    p.polyline(contour([[x - 4, 73], [x, 79], [x + 6, 85]]), STONE[3]);
    p.px(x + 4, 85, GOLD[3]);
  }
  for (let i = 0; i < 9; i++) p.line(121 + i * 9, 82, 125 + i * 9, 86, STONE[1]);
  // The furnace's open arch is cut into thick individual wedge stones.
  p.ellipse(179, 114, 17, 20, STONE[0]); p.rect(162, 114, 34, 22, STONE[0]);
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + i / 6 * Math.PI, x = 179 + Math.cos(a) * 20, y = 114 + Math.sin(a) * 21;
    block(p, x - 3, y - 3, 7, 7, STONE, seed + i);
  }
  for (const x of [158, 195]) masonry(p, x, 114, 6, 21, STONE, seed + x);
  p.poly([[165, 131], [189, 129], [196, 136], [163, 139]], GOLD[1]);
  p.line(166, 130, 189, 129, FIRE[2]);
  for (let i = 0; i < 6; i++) p.rect(165 + i * 4, 133, 1, 5, STONE[0]);
  // Broad anvil, bevelled horn, waist and pedestal, plus a cooling sword blank.
  painted(p, [[132, 129], [149, 127], [154, 132], [151, 142], [133, 143]], WOOD, seed);
  p.poly([[125, 117], [158, 115], [155, 120], [147, 123], [147, 128], [153, 130], [132, 131], [138, 126], [137, 122]], STONE[1]);
  p.poly([[125, 116], [154, 114], [159, 115], [153, 118], [130, 120]], STONE[4]);
  p.line(130, 117, 155, 115, STONE[6]); p.line(139, 123, 145, 123, STONE[3]);
  p.line(141, 128, 149, 129, STONE[3]); p.line(141, 113, 155, 112, FIRE[2]);
  p.poly([[127, 99], [132, 95], [137, 100], [135, 111], [131, 115], [127, 110]], STONE[2]);
  p.polyline([[128, 100], [132, 97], [135, 101], [134, 109]], GOLD[3]);
  for (const [x, y] of [[142, 93], [152, 94]]) {
    p.line(x, y, x - 2, y + 17, STONE[4]); p.line(x - 3, y + 3, x + 3, y + 3, GOLD[3]);
    p.line(x, y - 2, x, y + 1, WOOD[4]);
  }
  p.line(116, 97, 125, 97, WOOD[2]); p.ellipse(120, 105, 7, 8, WOOD[0]);
  p.line(117, 109, 123, 101, GOLD[3]); p.beam(116, 101, 122, 105, 2.5, STONE[4]);
}

function synthesis(p, seed) {
  p.ellipse(235, 142, 22, 5, WOOD[0]);
  block(p, 215, 139, 40, 5, STONE, seed); block(p, 222, 132, 25, 7, STONE, seed + 1);
  // Wing-like brass supports and a thick octagonal working surface.
  for (const side of [-1, 1]) {
    painted(p, [[235 + side * 13, 139], [235 + side * 11, 124], [235 + side * 19, 119], [235 + side * 21, 126]], GOLD, seed + side);
    p.line(235 + side * 14, 134, 235 + side * 16, 125, GOLD[4]);
  }
  p.poly([[213, 122], [222, 117], [247, 116], [257, 121], [252, 128], [220, 130]], GOLD[1]);
  painted(p, [[213, 121], [223, 116], [246, 115], [257, 120], [247, 124], [220, 126]], GOLD, seed, 0.6);
  p.ellipse(235, 120, 13, 3, ARCANE[0]); p.ellipse(235, 119, 10, 2, ARCANE[2]);
  p.poly([[215, 117], [222, 115], [229, 118], [229, 123], [221, 121], [215, 122]], GOLD[5]);
  p.line(221, 116, 221, 120, WOOD[3]);
  p.ellipse(251, 115, 2, 4, ROSE[4]); p.rect(250, 110, 2, 3, GOLD[4]);
  p.line(218, 103, 218, 114, GOLD[4]); p.circle(218, 103, 2, ARCANE[3]);
  // An armillary cradle lifts behind the crystal.
  p.arc(235, 104, 17, 1.7, Math.PI * 0.85, TAU + 0.2, GOLD[3]);
  p.arc(235, 104, 14, 0.7, Math.PI * 0.85, TAU + 0.2, GOLD[5]);
  p.circle(235, 87, 2, GOLD[4]);
}

function alley(p, seed) {
  painted(p, [[266, 85], [302, 76], [320, 85], [320, 142], [266, 140]], PLASTER, seed, -1);
  p.poly([[280, 99], [297, 93], [312, 101], [310, 140], [278, 140]], STONE[0]);
  painted(p, contour([[260, 89], [277, 76], [293, 59], [305, 70], [320, 75], [320, 92], [298, 87], [271, 94]]), ROSE, seed + 1, -0.2);
  p.polyline(contour([[260, 90], [283, 90], [301, 86], [320, 91]]), GOLD[2]);
  timber(p, [[269, 95], [267, 140]], 3);
  p.polyline([[284, 110], [284, 104], [292, 98], [300, 104], [300, 110]], WOOD[3]);
  // Noticeboard with rolled corners, sealing wax and an angled dagger pin.
  timber(p, [[264, 110], [262, 138]], 2);
  painted(p, [[253, 101], [271, 98], [274, 121], [253, 125]], WOOD, seed + 2);
  p.poly([[256, 104], [266, 102], [268, 116], [258, 119]], GOLD[5]);
  p.line(259, 106, 265, 105, WOOD[3]); p.line(259, 109, 265, 108, WOOD[3]); p.line(260, 112, 263, 112, WOOD[3]);
  p.circle(264, 115, 1.3, ROSE[3]); p.line(269, 99, 265, 105, STONE[5]);
  // Long coat, high cowl, layered boots and a pale half-visible face: an adventurer-scale informant.
  p.ellipse(292, 143, 12, 3, WOOD[0]);
  p.poly([[286, 130], [291, 128], [291, 141], [285, 142]], WOOD[1]);
  p.poly([[295, 128], [300, 129], [300, 141], [294, 141]], WOOD[1]);
  p.line(286, 134, 290, 134, GOLD[2]); p.line(296, 135, 300, 135, GOLD[2]);
  p.poly([[283, 117], [287, 112], [298, 111], [303, 132], [295, 136], [290, 128], [281, 134]], ARCANE[0]);
  p.poly([[285, 116], [288, 119], [285, 132], [281, 134]], ARCANE[2]);
  p.poly([[295, 116], [298, 117], [302, 131], [297, 133]], ARCANE[1]);
  p.poly([[284, 112], [287, 104], [292, 100], [298, 104], [301, 113], [295, 117]], ARCANE[1]);
  p.poly([[288, 109], [292, 105], [297, 110], [295, 116], [289, 116]], WOOD[0]);
  p.poly([[290, 111], [295, 110], [296, 113], [293, 116], [290, 114]], GOLD[3]);
  p.line(290, 108, 293, 105, STONE[4]); p.px(294, 111, STONE[6]);
  p.poly([[284, 117], [292, 120], [299, 117], [298, 121], [290, 123]], ROSE[3]);
  p.line(287, 123, 281, 128, ARCANE[3]); p.line(299, 121, 295, 125, ARCANE[2]);
  p.poly([[287, 122], [296, 122], [297, 128], [288, 129]], GOLD[5]);
  p.line(290, 124, 294, 124, WOOD[3]); p.line(290, 126, 295, 126, WOOD[3]);
  // Curved iron lamp bracket follows the shop's eave.
  p.polyline(contour([[309, 140], [310, 101], [310, 82], [303, 78], [299, 82]]), STONE[0]);
  p.polyline(contour([[310, 100], [308, 86], [302, 84]]), GOLD[2]);
}

function build(C, seed) {
  return bake(320, 180, p => {
    distance(p, C, seed);
    road(p, [C[0], C[1], C[2], C[3], C[4], C[5]], seed);
    alley(p, seed); shop(p, seed); smithy(p, C, seed); synthesis(p, seed);
    // Foreground ivy and stacked cargo tie the buildings to the ground plane.
    for (const x of [7, 314]) {
      p.polyline(contour([[x, 134], [x + 3, 110], [x - 2, 86], [x + 2, 69]]), GREEN[1]);
      for (let i = 0; i < 5; i++) sprig(p, x, 94 + i * 10, 1.2, GREEN, seed + i);
    }
    leafMass(p, 3, 176, 20, 12, GREEN, seed); leafMass(p, 318, 176, 25, 13, GREEN, seed + 3);
    // Water caught between foreground stones reflects the window and alchemy colours.
    p.ellipse(74, 161, 13, 2, mix(C[1], ARCANE[1], 0.4));
    p.line(65, 160, 75, 160, mix(C[3], GOLD[4], 0.3));
    p.ellipse(240, 158, 12, 1.8, mix(C[1], ARCANE[1], 0.5));
    p.line(236, 157, 244, 157, ARCANE[2]);
    painted(p, [[99, 131], [111, 128], [119, 132], [117, 145], [100, 147]], WOOD, seed);
    p.polyline([[100, 132], [117, 133], [116, 144], [100, 146], [100, 132], [116, 144]], WOOD[4]);
    p.ellipse(202, 140, 7, 3, WOOD[0]); p.ellipse(202, 134, 5, 7, WOOD[2]);
    p.ellipse(202, 129, 5, 2, WOOD[4]); p.line(198, 134, 207, 134, STONE[1]);
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
      blit(p, layer);
      smoke(p, 179, 27, u, seed, { count: 6, rise: 20, spread: 8 });
      flame(p, 179, 131, ph, 0.9);
      lantern(p, 96, 100, ph, 0.7); lantern(p, 301, 84, ph + 1, 0.8);
      const y = 112 + Math.sin(ph * 2) * 1.5;
      orbit(p, 235, y - 8, 13, 4, ph);
      crystal(p, 235, y, 6, 19);
      p.glow(235, y - 8, 16, ARCANE[3], 0.19); p.glow(235, 122, 10, ARCANE[4], 0.1);
      p.glow(51, 86, 12, FIRE[2], 0.08);
      p.text("?", 291, 92, GOLD[4], { font: "mini" });
      for (let i = 0; i < 6; i++) {
        const q = (u * 4 + i / 6) % 1;
        p.dot(178 + Math.sin(i * 2 + q * 5) * q * 10, 125 - q * 23, FIRE[3], Math.sin(q * Math.PI) * 0.7);
      }
    },
  };
}
