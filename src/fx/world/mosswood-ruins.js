// A belt-scroll dungeon room in a sunlit forest ruin. The floor is a wide, quiet walkway that fills the lower
// two fifths of the screen; fallen masonry and giant trunks stand along its far edge, a hazy forest scrolls
// slower behind them, and dark leaves frame the top and bottom in front of the fight.
//
// The scene is authored in world pixels and is wider than one screen. `o.view = { layer, x }` draws one layer of
// the 320 px window that starts at world x, so a host can rasterize layers separately and scroll them at their
// own parallax (see `map.layers`). Without a view the whole first screen is composited, as any other map.
import { fit, hex, mix, lerp, clamp, rand, rng, noise2, tileNoise, TAU, createFrame, clearFrame, painterFor } from "../../core/index.js";
import { blit, shaft } from "./_lib.js";
import { contour, rock } from "./_nature.js";
import { WOOD, STONE, painted, block, masonry, leafMass, sprig } from "./_settlement.js";

export const meta = {
  name: "Mosswood Ruins",
  desc: "A belt-scroll forest ruin: a wide mossy walkway under giant trunks and broken masonry, a hazy forest scrolling behind and dark leaves in front. Layered for parallax.",
  tags: ["map", "forest", "ruins", "fantasy", "arena", "day", "parallax", "belt-scroll", "dungeon", "loop"],
  kind: "map",
  size: [320, 180],
  origin: [0, 0],
  duration: 12,
  loop: true,
  fps: 30,
  bg: "dark",
  options: { palette: ["#111f2d", "#203b3a", "#345344", "#52734e", "#7e9d62", "#abc17e", "#d8d9a1", "#f7e8b5"], seed: 1 },
};

/**
 * Game-facing layout. `depth` is the band of screen rows a unit's feet may occupy (a belt-scroll floor has depth,
 * unlike the single `groundY` line of a side-on arena); `groundY` is its resting row. `layers` lists what a host
 * may rasterize separately: `parallax` is the share of camera travel the layer follows, `static` layers never
 * change, `front` layers draw over the units, and `live` layers are cheap enough to draw on the host every frame.
 */
export const map = {
  groundY: 138,
  depth: [114, 158],
  bounds: [8, 312],
  walk: [[8, 312]],
  platforms: [],
  spawns: { hero: [54, 138], mobs: [[152, 138], [198, 138]], boss: [262, 138] },
  arena: { x0: 8, x1: 312, groundY: 138 },
  length: 480,
  layers: [
    { id: "far", parallax: 0.4, static: false, front: false, fps: 12 },
    { id: "near", parallax: 1, static: true, front: false },
    { id: "air", parallax: 1, static: false, front: true, live: true },
    { id: "fore", parallax: 1, static: true, front: true },
  ],
};

const W = 320, H = 180, D = meta.duration, FLOOR = 108;
const HAZE = hex("#8fb09a"), SKY_LOW = hex("#5a8a8c"), SKY_LIT = hex("#e4e2ae");
/** Openings in the canopy, in far-layer and world pixels: the sky brightens and shafts fall here. */
const OPENINGS = [150, 430];

/**
 * `limb` from the nature kit with a decimated spine. A filled polygon costs its vertex count per pixel, and a
 * room-high trunk sampled every pixel has hundreds; one vertex every few pixels keeps the same silhouette.
 */
function limb(p, points, width, tip, colors, { seed = 1, bark = true, step = 5 } = {}) {
  const C = fit(colors, 5), full = contour(points);
  if (full.length < 2) return;
  const path = full.filter((_, i) => i % step === 0 || i === full.length - 1);
  const distances = [0];
  for (let i = 1; i < path.length; i++) distances.push(distances.at(-1) + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
  const length = distances.at(-1) || 1, radius = (i) => lerp(width, tip, distances[i] / length) * 0.5;
  const ribbon = (scale, shift, color) => {
    const left = [], right = [];
    for (let i = 0; i < path.length; i++) {
      const before = path[Math.max(0, i - 1)], after = path[Math.min(path.length - 1, i + 1)];
      const dx = after[0] - before[0], dy = after[1] - before[1], n = Math.hypot(dx, dy) || 1;
      const r = Math.max(0.35, radius(i)), x = path[i][0] + shift * r, y = path[i][1];
      left.push([x - dy / n * r * scale, y + dx / n * r * scale]);
      right.push([x + dy / n * r * scale, y - dx / n * r * scale]);
    }
    p.poly([...left, ...right.reverse()], color);
  };
  ribbon(1, 0, C[0]);
  ribbon(0.83, -0.02, C[2]);
  ribbon(0.27, -0.4, C[3]);
  if (!bark || width < 5) return;
  for (let i = 0; i < Math.floor(width * 0.75); i++) {
    const first = Math.floor(rand(seed, i, 1) * (path.length - 1) * 0.8);
    const last = Math.min(path.length - 1, first + 2 + Math.floor(rand(seed, i, 2) * path.length * 0.3));
    const side = (rand(seed, i, 3) - 0.5) * 1.2;
    p.polyline(path.slice(first, last + 1).map(([x, y], j) => [x + side * radius(first + j), y]), i % 4 === 0 ? C[4] : C[1]);
  }
}

/** Bake one layer of the 320 px window starting at world x. */
function bakeAt(vx, fn) {
  const f = createFrame(W, H, 0, 0, 2), p = painterFor(clearFrame(f));
  p.place(-vx, 0);
  fn(p, vx - 48, vx + W + 48);
  p.reset();
  return { w: f.w, h: f.h, density: f.density, color: f.color, light: f.light };
}

function far(p, x0, x1, C, seed) {
  p.shade(x0, 0, x1, 134, (x, y) => {
    let light = 0;
    for (const cx of OPENINGS) light = Math.max(light, 1 - Math.hypot((x - cx) / 170, (y - 44) / 120));
    return mix(SKY_LOW, SKY_LIT, Math.floor(Math.max(0, light) * 9) / 9);
  });
  for (let layer = 0; layer < 3; layer++) {
    const base = 104 + layer * 10, c = mix(HAZE, C[1], layer * 0.15);
    const F = [c, c, mix(c, C[3], 0.15), mix(c, C[4], 0.15), mix(c, C[5], 0.15)];
    for (let i = Math.floor(x0 / 46) - 1; i <= Math.ceil(x1 / 46) + 1; i++) {
      const x = i * 46 + rand(seed, i, layer) * 18, h = 50 + rand(seed, i, 8 + layer) * 42;
      const tw = 2.5 + layer;
      p.poly([[x - tw, base + 26], [x - 3 - tw * 0.6, base - h * 0.5], [x + 6.5, base - h], [x + 7.5, base - h], [x - 3 + tw * 0.6, base - h * 0.5], [x + tw, base + 26]], c);
      leafMass(p, x, base - h + 3, 36, 19, F, seed + i * 4 + layer);
      if (rand(seed, i, 30 + layer) > 0.5) leafMass(p, x + 20, base - h * 0.62, 20, 11, F, seed + i * 7 + layer);
    }
    // a pale colonnade stands between the middle and the nearest tree line
    if (layer === 1) {
      const S = [mix(HAZE, STONE[2], 0.45), mix(HAZE, STONE[3], 0.5), mix(HAZE, STONE[4], 0.5)];
      for (const [cx, top, cap] of [[196, 58, true], [226, 52, true], [256, 60, true], [286, 84, false], [44, 70, true], [392, 64, true], [420, 78, false]]) {
        p.rect(cx, top, 9, 124 - top, S[0]); p.rect(cx, top, 3, 124 - top, S[1]); p.rect(cx, top, 1, 124 - top, S[2]);
        if (cap) { p.rect(cx - 3, top - 4, 15, 4, S[1]); p.rect(cx - 3, top - 4, 15, 1, S[2]); }
      }
      p.rect(193, 46, 75, 7, S[0]); p.rect(193, 46, 75, 2, S[1]);
      p.poly([[268, 46], [280, 50], [268, 53]], S[0]);
    }
    // each tree line stands in its own ground haze
    p.shade(x0, base + 8, x1, 134, (x, y) => (noise2(x / 21, y / 5, seed + layer) > -0.2 - (y - base - 8) * 0.08 ? c : 0));
  }
  p.rect(x0, 126, x1 - x0, 8, mix(C[1], C[0], 0.3));
  for (const cx of OPENINGS) p.glow(cx, 60, 120, SKY_LIT, 0.1);
}

function mistAt(p, t, vx, seed) {
  const c = hex("#cfe0c4"), ph = (t / D) * 8;
  for (let b = 0; b < 3; b++) {
    const yy = Math.round(lerp(64, 118, (b + 0.5) / 3));
    for (let y = yy - 6; y <= yy + 6; y++)
      for (let x = vx; x < vx + W; x++) {
        const a = clamp((tileNoise(x / 38 + ph + b * 3.1, y / 7, 8, 0, seed + b * 11) - 0.05) * 0.16, 0, 0.09);
        if (a > 0.008) p.blend(x, y, c, a);
      }
  }
}

function floor(p, x0, x1, C, seed) {
  const EARTH = hex("#77734c");
  const G = [mix(C[0], C[1], 0.5), C[1], mix(C[2], EARTH, 0.18), mix(C[2], EARTH, 0.42), mix(C[3], EARTH, 0.5)]
    .map((c) => mix(c, C[6], 0.3));
  p.shade(x0, FLOOR, x1, H, (x, y) => {
    const v = (y - FLOOR) / (H - FLOOR);
    // a shadow under the far edge, the brightest earth through the fight band, falling off to the near edge
    let k = v < 0.07 ? 0.3 : v < 0.24 ? 1.3 + (v - 0.07) * 7 : 2.5 - Math.max(0, v - 0.6) * 4.2;
    k += noise2(x / 23, y / 7, seed + 5) * 0.6 + noise2(Math.floor(x / 3), Math.floor(y / 1.5), seed + 9) * 0.2;
    return G[clamp(Math.round(k), 0, G.length - 1)];
  });
  // worn slabs sunk into the earth: close in tone to the ground, so feet and shadows read over them
  const S = [G[1], G[2], mix(G[3], STONE[3], 0.3), mix(G[4], STONE[4], 0.3), mix(G[4], STONE[5], 0.35)];
  for (let row = 0; row < 5; row++) {
    const y = 118 + row * 8.5, step = 20 + row * 5;
    for (let i = Math.floor(x0 / step) - 1; i <= Math.ceil(x1 / step) + 1; i++) {
      if (rand(seed, row, i, 3) > 0.62) continue;
      const px = i * step + (row % 2) * step * 0.5 + rand(seed, row, i) * 5, py = y + rand(seed + 2, row, i) * 2.5;
      const w = step * (0.62 + rand(seed + 4, row, i) * 0.22);
      const pts = [[px + 2, py], [px + w - 3, py - 1], [px + w, py + 3], [px + w - 4, py + 5], [px, py + 5], [px - 1, py + 2]];
      painted(p, pts, S.slice(0, 5), seed + i * 13 + row, -0.9);
      p.line(px + 3, py, px + w - 4, py - 1, S[4]);
      p.line(px + 1, py + 5, px + w - 4, py + 5, S[0]);
    }
  }
  // light settles where the canopy opens
  for (const cx of OPENINGS) { p.glow(cx + 6, 132, 78, C[5], 0.07); p.glow(cx + 6, 128, 34, C[6], 0.05); }
  // fallen leaves, and growth only along the two edges
  for (let i = Math.floor(x0 / 9); i <= Math.ceil(x1 / 9); i++) {
    const x = i * 9 + rand(seed, i, 41) * 9, y = 114 + rand(seed, i, 42) * 62;
    if (rand(seed, i, 43) > 0.55) { p.px(x, y, rand(seed, i, 44) > 0.6 ? hex("#b79a4e") : C[4]); p.px(x + 1, y, C[3]); }
    const edge = rand(seed, i, 45) > 0.5 ? 110 + rand(seed, i, 46) * 5 : 164 + rand(seed, i, 46) * 14;
    if (rand(seed, i, 47) > 0.45) sprig(p, x, edge, 0.7 + rand(seed, i, 48) * 0.7, C, seed + i);
    if (rand(seed, i, 49) > 0.86) { p.px(x + 3, edge - 3, hex("#f1e3a0")); p.px(x + 3, edge - 2, C[4]); }
  }
}

function ruins(p, C, seed) {
  const M = STONE.map((c, i) => mix(c, C[Math.min(i, 5)], 0.34));
  const moss = [C[3], C[4]];
  // a gate wall with a pointed doorway, broken at the shoulders
  for (const [x, y, w, h] of [[76, 62, 28, 52], [102, 34, 54, 80], [154, 50, 24, 64], [176, 84, 16, 30]]) masonry(p, x, y, w, h, M, seed + x);
  p.poly(contour([[112, 114], [112, 76], [119, 60], [128, 52], [137, 60], [144, 76], [144, 114]]), mix(M[0], C[0], 0.5));
  p.polyline(contour([[111, 114], [111, 76], [118, 59], [128, 50], [138, 59], [145, 76], [145, 114]]), M[5]);
  p.polyline(contour([[109, 114], [109, 75], [117, 57], [128, 48], [139, 57], [147, 75], [147, 114]]), M[1]);
  p.poly([[116, 114], [122, 86], [134, 86], [140, 114]], mix(C[1], HAZE, 0.3));
  p.poly([[122, 114], [125, 94], [131, 94], [134, 114]], mix(C[2], HAZE, 0.5));
  p.glow(128, 100, 26, HAZE, 0.16);
  for (const [x, y] of [[84, 61], [108, 33], [134, 32], [150, 35], [164, 49], [183, 83]]) leafMass(p, x, y, 10, 4, [C[1], C[2], C[3], C[4], C[5]], seed + x);
  for (let i = 0; i < 6; i++) {
    const x = 82 + i * 18, len = 14 + rand(seed, i, 61) * 26, top = i >= 2 && i <= 3 ? 36 : i === 4 ? 52 : 64;
    p.polyline(contour([[x, top], [x + 2, top + len * 0.5], [x - 1, top + len]]), C[2]);
    sprig(p, x - 1, top + len, 1, C, seed + i);
  }
  // steps up to the gate
  block(p, 96, 109, 64, 5, M, seed + 3); block(p, 103, 105, 50, 4, M, seed + 4);
  // standing and fallen columns further along the room
  for (const [x, top, cap] of [[316, 48, true], [346, 86, false], [546, 44, true], [576, 60, true]]) {
    painted(p, [[x, 112], [x + 1, top], [x + 13, top], [x + 14, 112]], M, seed + x, 0.5);
    p.rect(x + 1, top, 2, 112 - top, M[5]); p.rect(x + 6, top + 3, 1, 108 - top, M[1]); p.rect(x + 9, top + 3, 1, 108 - top, M[1]); p.rect(x + 12, top, 2, 112 - top, M[0]);
    block(p, x - 3, 108, 20, 6, M, seed + x);
    if (cap) block(p, x - 3, top - 6, 20, 6, M, seed + x + 1);
    else for (let k = 0; k < 4; k++) p.px(x + 2 + k * 3, top - 1 - (k % 2), M[3]);
    sprig(p, x + 3, top, 1.2, C, seed + x);
  }
  block(p, 366, 103, 34, 10, M, seed + 7);
  rock(p, 404, 108, 9, 6, M.slice(0, 5), { seed: seed + 8, moss });
  rock(p, 232, 109, 12, 7, M.slice(0, 5), { seed: seed + 9, moss });
  rock(p, 492, 108, 14, 8, M.slice(0, 5), { seed: seed + 10, moss });
}

function hedge(p, x0, x1, C, seed) {
  const Hc = [C[0], C[1], mix(C[1], C[2], 0.5), C[2], C[3]];
  for (let i = Math.floor(x0 / 24) - 1; i <= Math.ceil(x1 / 24) + 1; i++) {
    const x = i * 24 + rand(seed, i, 71) * 10, r = rand(seed, i, 72);
    leafMass(p, x, 105 - r * 3, 17 + r * 9, 6 + r * 4, Hc, seed + i * 3);
  }
}

function giant(p, x, C, seed, width = 24, lean = 6) {
  const B = WOOD.slice(0, 5);
  limb(p, [[x, 118], [x - lean * 0.6, 84], [x + lean * 0.3, 44], [x + lean, -12]], width, width * 0.7, B, { seed });
  for (let i = 0; i < 5; i++) {
    const dir = i % 2 ? 1 : -1, reach = width * (0.7 + rand(seed, i, 81) * 0.6);
    limb(p, [[x + dir * width * 0.2, 104], [x + dir * reach * 0.6, 114], [x + dir * reach, 118 + (i % 3)]], width * 0.3, 1, B, { seed: seed + i, bark: false });
  }
  limb(p, [[x + lean * 0.2, 52], [x + lean + 22, 28], [x + lean + 48, 14]], width * 0.4, 2, B, { seed: seed + 9 });
  limb(p, [[x, 66], [x - 24, 40], [x - 44, 20]], width * 0.34, 2, B, { seed: seed + 11 });
  // moss on the weather side and a hanging vine
  leafMass(p, x - width * 0.34, 98, width * 0.26, 10, [C[1], C[2], C[2], C[3]], seed + 5);
  leafMass(p, x - width * 0.1, 112, width * 0.5, 4, [C[1], C[2], C[2], C[3]], seed + 6);
  p.polyline(contour([[x + width * 0.4, 30], [x + width * 0.55, 58], [x + width * 0.4, 84]]), C[2]);
}

function near(p, x0, x1, C, seed) {
  floor(p, x0, x1, C, seed);
  hedge(p, x0, x1, C, seed + 40);
  ruins(p, C, seed + 20);
  for (const [x, w, lean, s] of [[36, 26, 5, 1], [268, 20, -6, 2], [452, 26, 7, 3], [628, 22, -5, 4]]) giant(p, x, C, seed + 60 + s * 17, w, lean);
  // the canopy the trunks hold up: dark from below, lit where it faces the openings
  const L = [C[0], C[1], C[2], C[3], C[4]];
  for (let i = Math.floor(x0 / 52) - 1; i <= Math.ceil(x1 / 52) + 1; i++) {
    const x = i * 52 + rand(seed, i, 91) * 20;
    if (OPENINGS.some((cx) => Math.abs(x - cx) < 46)) continue;
    leafMass(p, x, 4 + rand(seed, i, 92) * 10, 42, 17, L, seed + i * 5);
  }
}

function fore(p, x0, x1, C, seed) {
  const Dk = [mix(C[0], hex("#05080d"), 0.5), C[0], mix(C[0], C[1], 0.6), C[1]];
  for (let i = Math.floor(x0 / 70) - 1; i <= Math.ceil(x1 / 70) + 1; i++) {
    const x = i * 70 + rand(seed, i, 101) * 30;
    if (rand(seed, i, 102) > 0.72) continue;
    leafMass(p, x, -3 + rand(seed, i, 103) * 4, 38, 13, Dk, seed + i * 9);
    if (rand(seed, i, 104) > 0.4) {
      const vx = x + 12, len = 12 + rand(seed, i, 105) * 12;
      p.polyline(contour([[vx, 6], [vx + 2, 6 + len * 0.5], [vx - 1, 6 + len]]), Dk[1]);
      leafMass(p, vx - 1, 6 + len, 3, 2, Dk, seed + i);
    }
  }
  for (let i = Math.floor(x0 / 5); i <= Math.ceil(x1 / 5); i++) {
    const x = i * 5 + rand(seed, i, 111) * 5, hh = 3 + rand(seed, i, 112) * 7;
    if (rand(seed, i, 113) > 0.6) continue;
    p.poly([[x - 1.5, H], [x + rand(seed, i, 114) * 4 - 2, H - hh], [x + 1.5, H]], rand(seed, i, 115) > 0.5 ? Dk[1] : Dk[2]);
  }
  for (let i = Math.floor(x0 / 90); i <= Math.ceil(x1 / 90); i++) {
    const x = i * 90 + 20 + rand(seed, i, 121) * 50;
    for (let k = 0; k < 6; k++) {
      const a = -Math.PI / 2 + (k - 2.5) * 0.36, len = 9 + rand(seed, i, 122 + k) * 6;
      p.polyline(contour([[x, H + 1], [x + Math.cos(a) * len * 0.6, H - len * 0.7], [x + Math.cos(a) * len * 1.3, H - len * 0.75]]), k % 2 ? Dk[2] : Dk[1]);
    }
  }
}

/** Fireflies, drifting motes and falling leaves along the whole room, in world pixels shifted by dx. */
function air(p, t, dx, seed, length, clip = false) {
  if (clip) {
    const q = p;
    p = { dot: (x, y, c, a) => x >= 2 && x < W - 2 && q.dot(x, y, c, a), px: (x, y, c) => x >= 2 && x < W - 2 && q.px(x, y, c), glow: (x, y, r, c, k) => x >= 8 && x < W - 8 && q.glow(x, y, r, c, k) };
  }
  const ph = (t / D) * TAU, fly = hex("#e6ff9a"), hot = hex("#ffffff"), mote = hex("#f2efcf"), leaf = hex("#a9c46a"), back = hex("#e2ecae");
  const n = Math.round(length / 28);
  for (let i = 0; i < n; i++) {
    const g = rng(seed, i, 4), bx = g.next() * length, by = lerp(52, 150, g.next());
    const x = bx + Math.sin(ph * (1 + (i % 3)) + i * 2.1) * (9 + g.next() * 9) + dx;
    const y = by + Math.cos(ph * (1 + ((i + 1) % 3)) + i * 1.7) * (4 + g.next() * 6);
    const tw = 0.5 + 0.5 * Math.sin(ph * (3 + (i % 4)) + i * 1.3), a = 0.35 + tw * 0.65;
    p.dot(x, y, tw > 0.55 ? hot : fly, a);
    p.glow(x, y, 4 + tw * 2, fly, 0.16 * a);
  }
  for (let i = 0; i < n * 2; i++) {
    const g = rng(seed, i, 6), bx = g.next() * length, by = lerp(20, 150, g.next());
    const x = bx + Math.sin(ph * (1 + (i % 3)) + i) * 5 + dx, y = by - (((t / D) * 68 + i * 13) % 34) + 17;
    p.dot(x, y, mote, 0.16 + 0.18 * Math.sin(ph * 2 + i * 1.9));
  }
  for (let i = 0; i < Math.round(n * 0.7); i++) {
    const g = rng(seed, i, 5), sx = g.next() * length, sy = lerp(10, 40, g.next());
    const x = sx + Math.sin(ph * 2 + i * 1.8) * (8 + g.next() * 10) + dx, y = sy + (((t / D) * 240 + i * 17) % 120);
    const flip = Math.sin(ph * 3 + i * 1.7);
    p.px(x, y, flip > 0 ? back : leaf); p.px(x + 1, y, leaf);
    if (Math.abs(flip) < 0.4) p.px(x, y + 1, leaf);
  }
}

export function create(o) {
  const C = fit(o.palette, 8), seed = o.seed ?? 1;
  const view = o.view ?? { layer: "all", x: 0 }, vx = view.x ?? 0, only = view.layer ?? "all";
  const has = (id) => only === "all" || only === id;
  const L = {
    far: has("far") ? bakeAt(vx, (p, x0, x1) => far(p, x0, x1, C, seed)) : null,
    near: has("near") ? bakeAt(vx, (p, x0, x1) => near(p, x0, x1, C, seed)) : null,
    fore: has("fore") ? bakeAt(vx, (p, x0, x1) => fore(p, x0, x1, C, seed)) : null,
  };
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      const tt = t % D;
      if (L.far) {
        blit(p, L.far);
        mistAt({ blend: (x, y, c, a) => p.blend(x - vx, y, c, a) }, tt, vx, seed + 5);
        for (const cx of OPENINGS) {
          if (cx - vx < 44 || cx - vx > W - 44) continue;
          shaft(p, tt, D, { x: cx - vx - 14, w: 26, y: 0, h: 132, color: "#fff3c4", seed: cx, k: 0.1 });
          shaft(p, tt, D, { x: cx - vx + 22, w: 14, y: 0, h: 126, color: "#fff3c4", seed: cx + 3, k: 0.07 });
        }
      }
      if (L.near) blit(p, L.near);
      // a live layer is drawn by the host in world pixels; composited views shift it into the window
      if (has("air")) air(p, tt, only === "air" ? 0 : -vx, seed + 3, map.length, only !== "air");
      if (L.fore) blit(p, L.fore);
    },
  };
}
