// Ember Town at dusk: a market street of timber stalls, a glowing forge, hanging lanterns and a well at the crossroads.
import { fit, hex, mix, rand, TAU } from "../../core/index.js";
import { bake, blit, sky, stars, moon, ridge, mist, fireflies, motes } from "./_lib.js";
import { contour, rock, marshTree, massif, conifer } from "./_nature.js";
import { WOOD, STONE, GOLD, FIRE, ARCANE, painted, block, masonry, timber, leafMass, sprig, road, lantern, flame, smoke, crystal } from "./_settlement.js";

export const meta = {
  name: "Ember Town",
  desc: "余烬镇：黄昏集市长街，条纹雨棚摊位、冒烟的铁匠铺、吊灯与水井，屋檐下晾着成排灯笼。A lantern-lit market street of striped awnings, a working forge and a central well.",
  tags: ["map", "town", "market", "shop", "forge", "blacksmith", "well", "lantern", "镇", "集市", "铁匠铺", "水井", "灯笼", "fantasy", "loop"],
  kind: "map", size: [320, 180], origin: [0, 0], duration: 12, loop: true, fps: 30, bg: "dark",
  options: { palette: ["#1a1428", "#2e2140", "#4a2f4e", "#6e4460", "#96687a", "#c99a8e", "#eec49a", "#ffe9c0"], seed: 1 },
};
export const map = {
  groundY: 150, bounds: [8, 312], walk: [[8, 312]], platforms: [],
  spawns: { hero: [70, 150], mobs: [[176, 150], [238, 150]], boss: [290, 150] },
  arena: { x0: 8, x1: 312, groundY: 150 },
};
const D = meta.duration;
const PLASTER = ["#33283e", "#5a4450", "#7d5f68", "#a5838a", "#c8ab98", "#e3cba8", "#f6e2b8"].map(hex);
const AWNING_R = ["#3a1c2e", "#6e2c42", "#a84858", "#d07068", "#ec9a80", "#f8c8a0", "#ffe9c8"].map(hex);
const AWNING_B = ["#1c2a3e", "#2c4662", "#3e6286", "#5a84a8", "#82a8c4", "#acc8dc", "#dcf0f8"].map(hex);
const IRON = ["#141420", "#26283a", "#3e4056", "#5a5c74", "#82849a", "#b4b6c8", "#e8eaf4"].map(hex);

function skyline(p, C, seed) {
  sky(p, 320, 140, hex("#120e24"), hex("#5a3450"), { horizon: 140, steps: 7, seed });
  stars(p, 320, 120, seed, 60, 80, "#d8ccff");
  moon(p, 52, 34, 11, hex("#f6e0b0"), hex("#c47a50"), seed + 2);
  // a far conifer ridge, then a town silhouette of stepped roofs and one tall spire
  massif(p, [[40, 96, 90], [180, 104, 110], [290, 92, 80]], 128, ["#1e1838", "#2c2148", "#3e2c58", "#54406e", "#6e5484", "#8a6a9c", "#b89ac0", "#e0c8e0"], { seed, snowline: 84, snow: false, detail: false });
  for (let i = 0; i < 7; i++) {
    const x = i * 52 + rand(seed, i, 5) * 18 - 10, h = 30 + rand(seed, i, 6) * 26;
    conifer(p, x, 124, h, 9 + rand(seed, i, 7) * 5, ["#141426", "#1e1e34", "#2a2a48", "#38385e", "#4a4a78", "#6a6a9c"], { seed: seed + i, detail: false });
  }
  // roofline: stepped gables and a bell tower
  for (const [x, w, h] of [[8, 40, 26], [58, 34, 20], [110, 44, 30], [170, 36, 22], [216, 40, 34], [268, 36, 24], [300, 20, 18]]) {
    painted(p, [[x, 126], [x, 126 - h], [x + w * 0.5, 126 - h - 10], [x + w, 126 - h], [x + w, 126]], PLASTER.map((c, i) => mix(c, hex("#2a2038"), 0.45)), seed + x, -0.5);
    p.poly([[x - 2, 126 - h], [x + w * 0.5, 126 - h - 12], [x + w + 2, 126 - h]], WOOD[2]);
    for (let wy = 126 - h + 6; wy < 122; wy += 8) {
      p.rect(x + 4 + (wy % 16 === 6 ? 8 : 0), wy, 3, 4, mix(FIRE[3], hex("#000000"), 0.15));
      p.glow(x + 5 + (wy % 16 === 6 ? 8 : 0), wy + 2, 6, FIRE[2], 0.1);
    }
  }
  // the bell tower
  painted(p, [[146, 126], [146, 78], [162, 78], [162, 126]], PLASTER.map((c) => mix(c, hex("#241c34"), 0.35)), seed + 99, -0.3);
  p.poly([[142, 80], [154, 62], [170, 80]], WOOD[1]);
  p.rect(150, 66, 8, 6, GOLD[2]); p.px(154, 69, GOLD[5]);
  p.rect(152, 84, 4, 7, hex("#1c1428")); p.glow(154, 88, 7, FIRE[2], 0.16);
}

function stall(p, x, baseY, w, awn, seed, goods) {
  // posts, counter, sloped striped awning, crates of goods
  for (const px of [x, x + w - 3]) timber(p, [[px, baseY - 34], [px + 1, baseY]], 2.6);
  painted(p, [[x - 3, baseY - 12], [x + w + 3, baseY - 14], [x + w + 5, baseY], [x - 5, baseY]], WOOD, seed, -0.3);
  p.polyline([[x - 3, baseY - 11], [x + w + 3, baseY - 13]], WOOD[5]);
  for (let i = 0; i < 6; i++) p.rect(x - 2 + i * (w / 6), baseY - 13 + (i % 2), w / 6, 2, WOOD[1]);
  // awning: scalloped stripes with a lit lip
  const n = 5, sw = (w + 10) / n;
  for (let i = 0; i < n; i++) {
    const ax = x - 5 + i * sw;
    painted(p, [[ax, baseY - 36], [ax + sw * 0.5, baseY - 44], [ax + sw, baseY - 36], [ax + sw - 2, baseY - 31], [ax + 2, baseY - 31]], awn, seed + i * 3, i % 2 ? 0.5 : -0.2);
    p.poly([[ax + sw - 3, baseY - 35], [ax + sw - 1.5, baseY - 30], [ax + sw - 4, baseY - 29]], awn[awn === AWNING_R ? 5 : 5]);
  }
  p.polyline(contour([[x - 6, baseY - 35], [x + w * 0.5, baseY - 43], [x + w + 6, baseY - 35]]), GOLD[4]);
  // goods on the counter
  for (let i = 0; i < goods; i++) {
    const gx = x + 4 + rand(seed, i, 21) * (w - 10), gy = baseY - 16 - rand(seed, i, 22) * 3;
    if (i % 3 === 0) { p.ellipse(gx, gy, 2.4, 1.8, FIRE[3]); p.px(gx, gy - 1, FIRE[4]); }
    else if (i % 3 === 1) p.rect(gx, gy, 4, 3, hex(i % 2 ? "#7a5a8a" : "#4a7a5a"));
    else p.poly([[gx, gy - 3], [gx + 2, gy], [gx - 2, gy]], GOLD[3]);
  }
}

function forge(p, C, seed) {
  // the smithy: tall stone chimney, open forge mouth glowing, anvil out front
  masonry(p, 252, 96, 62, 54, STONE, seed);
  p.rect(252, 96, 62, 4, STONE[5]);
  // chimney
  masonry(p, 292, 62, 16, 36, STONE, seed + 4);
  p.rect(290, 60, 20, 4, STONE[4]);
  p.rect(296, 64, 8, 30, STONE[1]);
  // roof: steep tiled gable
  painted(p, contour([[246, 98], [258, 74], [312, 70], [318, 98]]), ["#2a1e30", "#4a2c40", "#6e3a4e", "#96566a", "#c07a80", "#e8a890", "#ffd9b0"], seed + 8, 0.3);
  for (let i = 0; i < 6; i++) p.line(252 + i * 11, 96 - i * 3, 264 + i * 11, 94 - i * 3, hex("#3a2438"));
  // open forge mouth: dark arch with an inner glow
  p.poly([[266, 150], [266, 118], [282, 108], [298, 118], [298, 150]], hex("#120c14"));
  p.poly([[270, 148], [270, 122], [284, 114], [298, 122], [298, 148]], FIRE[1]);
  p.poly([[274, 147], [274, 126], [284, 120], [294, 126], [294, 147]], FIRE[2]);
  p.ellipse(284, 146, 8, 4, FIRE[3]);
  p.line(280, 140, 288, 140, FIRE[4]);
  // anvil and quench barrel
  block(p, 236, 138, 14, 8, IRON.map((c, i) => mix(c, STONE[i], 0.4)), seed + 12);
  p.rect(232, 134, 22, 5, IRON[3]); p.rect(240, 130, 6, 4, IRON[4]);
  p.ellipse(310, 146, 6, 7, WOOD[2]); p.ellipse(310, 140, 6, 2.4, WOOD[3]);
  p.line(304, 143, 316, 143, GOLD[3]);
  // hanging sign: a horseshoe over the door
  p.line(284, 104, 284, 96, GOLD[3]);
  p.arc(284, 92, 5, 1.6, Math.PI, TAU, GOLD[4]);
  p.line(279, 88, 284, 84, GOLD[4]); p.line(289, 88, 284, 84, GOLD[4]);
}

function well(p, C, seed) {
  // stone well with a little tiled roof and a bucket on a rope
  masonry(p, 138, 128, 44, 24, STONE, seed + 20);
  p.ellipse(160, 128, 24, 6, STONE[0]);
  p.ellipse(160, 127, 19, 4.6, hex("#0e1420"));
  p.ellipse(160, 127, 15, 3.4, hex("#1c3040"));
  p.px(156, 126, hex("#4a90b8")); p.px(164, 125, hex("#6ab8d8"));
  for (const x of [142, 178]) timber(p, [[x, 96], [x + 1, 128]], 2.6);
  painted(p, contour([[132, 100], [150, 82], [172, 84], [186, 102], [178, 104], [160, 94], [144, 104]]), ["#2a1e30", "#4a2c40", "#6e3a4e", "#96566a", "#c07a80", "#e8a890"], seed + 24, 0.2);
  timber(p, [[138, 94], [182, 94]], 2);
  p.line(160, 94, 160, 106, WOOD[4]);
  p.rect(157, 104, 6, 5, WOOD[2]); p.rect(157, 104, 6, 1, GOLD[4]);
}

function cratesAndBarrels(p, C, seed) {
  painted(p, [[18, 132], [34, 128], [38, 150], [22, 154]], WOOD, seed + 1, -0.4);
  block(p, 17, 127, 18, 3, WOOD[4], 5);
  p.line(21, 134, 35, 136, WOOD[4]); p.line(23, 144, 36, 144, WOOD[3]);
  // sacks and a cart wheel leaning on the wall
  p.ellipse(44, 147, 7, 5, hex("#8a7448")); p.ellipse(44, 144, 6, 3.4, hex("#a8905c"));
  p.line(38, 146, 50, 146, hex("#5a4828"));
  p.ring(58, 140, 8, 2, WOOD[3]); p.ring(58, 140, 5, 1, WOOD[2]);
  p.line(52, 134, 64, 146, WOOD[2]); p.line(52, 146, 64, 134, WOOD[2]);
  // flower boxes under the left windows
  for (const [x, col] of [[66, "#e86a7a"], [84, "#f0c05a"], [102, "#9a7ae8"]]) {
    p.rect(x, 122, 10, 3, WOOD[2]);
    for (let i = 0; i < 4; i++) { p.px(x + 1 + i * 2.4, 121, hex(col)); p.px(x + 1 + i * 2.4, 120, hex(col)); }
    p.px(x + 2, 119, hex("#d8e86a"));
  }
}

function build(C, seed) {
  return bake(320, 180, p => {
    skyline(p, C, seed);
    road(p, C.slice(0, 6), seed, false);
    // market street furniture
    stall(p, 20, 138, 52, AWNING_R, seed + 1, 4);
    stall(p, 196, 140, 46, AWNING_B, seed + 7, 3);
    well(p, C, seed);
    forge(p, C, seed);
    cratesAndBarrels(p, C, seed);
    // bunting strung stall to stall
    for (let s = 0; s < 2; s++) {
      const x0 = s ? 150 : 76, x1 = s ? 218 : 150, y0 = s ? 108 : 102, y1 = s ? 112 : 106;
      p.polyline(contour([[x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2 + 8], [x1, y1]]), WOOD[4]);
      for (let i = 1; i < 7; i++) {
        const u = i / 7, bx = x0 + (x1 - x0) * u, by = y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * 8;
        p.poly([[bx - 2, by], [bx + 2, by], [bx, by + 5]], i % 2 ? GOLD[3] : hex("#c86a7a"));
      }
    }
    // foreground: doorsteps, a cat on the wall, crates at the edges
    for (const [x, w] of [[66, 22], [176, 18]]) {
      p.rect(x, 146, w, 4, STONE[2]); p.rect(x, 146, w, 1, STONE[4]);
      p.rect(x + 3, 142, 8, 4, hex("#1c1428")); p.glow(x + 7, 144, 6, FIRE[2], 0.12);
    }
    // a cat silhouette on the forge wall
    p.ellipse(268, 112, 4, 3, hex("#0e0a14"));
    p.poly([[265, 110], [266, 106], [268, 110]], hex("#0e0a14"));
    p.poly([[271, 110], [272, 106], [273, 110]], hex("#0e0a14"));
    p.line(272, 115, 276, 117, hex("#0e0a14"));
    leafMass(p, 4, 182, 24, 10, C, seed + 31);
    leafMass(p, 316, 182, 26, 11, C, seed + 37);
    // warm window light pooled on the street
    p.glow(160, 138, 30, FIRE[2], 0.1);
    p.glow(284, 132, 22, FIRE[2], 0.12);
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
      mist(p, localTime, D, { y0: 60, y1: 120, color: "#8a6a8a", seed, bands: 2, alpha: 0.06 });
      // the forge never sleeps
      flame(p, 284, 142, ph * 1.3, 0.8);
      smoke(p, 300, 58, u, seed, { count: 6, rise: 46, spread: 5 });
      // lanterns along the street sway and breathe
      for (const [x, y, s, ph0] of [[88, 104, 0.9, 0], [160, 100, 1.05, 2.1], [232, 106, 0.85, 4.2], [30, 118, 0.75, 1.2]]) {
        lantern(p, x, y, ph + ph0, s);
      }
      // forge mouth embers and sparks
      for (let i = 0; i < 8; i++) {
        const q = (u * 4 + i / 8) % 1, x = 274 + rand(seed, i, 70) * 20 + Math.sin(ph * 2 + i) * 3;
        const y = 136 - q * 20;
        p.dot(x, y, i % 2 ? FIRE[3] : FIRE[4], Math.sin(q * Math.PI) * 0.6);
      }
      // chimney sparks
      for (let i = 0; i < 5; i++) {
        const q = (u * 2.6 + i / 5) % 1;
        p.dot(300 + Math.sin(q * 6 + i) * 4, 56 - q * 30, FIRE[2], Math.sin(q * Math.PI) * 0.4);
      }
      fireflies(p, localTime, D, { count: 10, x0: 10, x1: 310, y0: 70, y1: 140, color: "#ffd9a0", seed: seed + 5 });
      motes(p, localTime, D, { count: 20, color: "#e8c8a0", seed: seed + 9, y0: 80, y1: 146 });
    },
  };
}
